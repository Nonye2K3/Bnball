### Multi-stage Dockerfile for production
# Builder: install deps and build client + bundle server
FROM node:18-bullseye AS builder

WORKDIR /app

# Declare build arguments BEFORE they're needed
ARG VITE_WALLETCONNECT_PROJECT_ID
ARG VITE_PREDICTION_MARKET_CONTRACT_MAINNET

# Set as environment variables so Vite can access them during build
ENV VITE_WALLETCONNECT_PROJECT_ID=$VITE_WALLETCONNECT_PROJECT_ID
ENV VITE_PREDICTION_MARKET_CONTRACT_MAINNET=$VITE_PREDICTION_MARKET_CONTRACT_MAINNET

# Improve caching by copying package manifest first
COPY package.json package-lock.json* ./

# Install system dependencies required for some native modules (canvas, etc.)
# and build tools used during the npm install/build steps.
RUN apt-get update \
	&& apt-get install -y --no-install-recommends \
		build-essential \
		python3 \
		python3-dev \
		pkg-config \
		libcairo2-dev \
		libjpeg-dev \
		libpango1.0-dev \
		libgif-dev \
		librsvg2-dev \
		libffi-dev \
	&& rm -rf /var/lib/apt/lists/*

# Install all deps (including dev deps required for build)
RUN npm ci --unsafe-perm --legacy-peer-deps --silent || npm install --unsafe-perm --legacy-peer-deps --silent

# Copy rest of the repository
COPY . .

# Build the frontend (Vite) and bundle the server with esbuild
RUN npm run build

# Remove dev dependencies to slim image (this prunes in builder so we can copy node_modules)
RUN npm prune --production --silent || true


### Runner: smaller image to run the built app
FROM node:18-bullseye-slim AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

# Copy built server + client from builder
COPY --from=builder /app/dist ./dist
# Copy production node_modules and package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Use a non-root user for better security
RUN addgroup --system app && adduser --system --ingroup app app || true
USER app

EXPOSE 5000

# Start the bundled server
CMD ["node", "dist/index.js"]
