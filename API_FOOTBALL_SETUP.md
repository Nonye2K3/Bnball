# API Football Setup Instructions

## ⚠️ Action Required: Get Valid API Key

The API key you provided (`7458a2af283b76359064838f875391`) is returning an error: **"You are not subscribed to this API."**

This means you need to get a valid API-Football subscription key.

---

## 🔑 How to Get a Valid API Key

### Option 1: Direct from API-Football (Recommended)

1. **Visit**: https://www.api-football.com/
2. **Sign Up**: Create a free account
3. **Choose Plan**: 
   - Free tier: 100 requests/day
   - Paid plans: More requests
4. **Get API Key**: Copy your API key from the dashboard
5. **Update .env**: Replace the value of `API_FOOTBALL_KEY`

```bash
# In /workspace/.env
API_FOOTBALL_KEY=your_new_api_key_here
```

### Option 2: Via RapidAPI

1. **Visit**: https://rapidapi.com/api-sports/api/api-football
2. **Subscribe**: Choose a pricing plan
   - Basic: Free (100 requests/day)
   - Pro: $4.99/mo (1000 requests/day)
   - Ultra: $9.99/mo (10,000 requests/day)
3. **Get API Key**: Copy the `x-rapidapi-key` from the dashboard
4. **Update Backend**: You'll need to modify the service to use RapidAPI headers

---

## 🔧 If Using RapidAPI Key

If you get your key from RapidAPI, you'll need to update the backend service:

**File**: `/workspace/server/services/apiFootball.ts`

**Change**:
```typescript
// Current (lines 136-138)
const API_KEY = process.env.API_FOOTBALL_KEY;
const BASE_URL = "https://v3.football.api-sports.io";

// Change to (for RapidAPI):
const API_KEY = process.env.API_FOOTBALL_KEY;
const BASE_URL = "https://api-football-v1.p.rapidapi.com/v3";
```

**And update headers (lines 158-163)**:
```typescript
// Current:
const response = await fetch(url, {
  method: 'GET',
  headers: {
    'x-apisports-key': API_KEY,
  },
});

// Change to (for RapidAPI):
const response = await fetch(url, {
  method: 'GET',
  headers: {
    'x-rapidapi-key': API_KEY,
    'x-rapidapi-host': 'api-football-v1.p.rapidapi.com',
  },
});
```

---

## ✅ After Updating the API Key

1. **Restart the server**:
```bash
npm run dev
```

2. **Test the integration**:
```bash
# From your browser console or terminal
fetch('/api/markets/sync-football', { method: 'POST' })
  .then(r => r.json())
  .then(console.log)
```

3. **Check the Markets page**: You should see live football matches

---

## 📊 What Works Now (Without Valid API Key)

### ✅ Fully Functional:
- Smart contract deployment
- $2 USD registration fee system
- User registration flow
- Betting functionality
- Winnings claiming
- All blockchain interactions

### ⏳ Waiting for API Key:
- Live football match data
- Real-time odds updates
- League standings
- Auto-sync of football markets

**Note**: You can still create custom prediction markets manually. The football integration is a bonus feature that requires the API key.

---

## 🎯 Alternative: Use Mock Data (For Testing)

If you want to test the UI without waiting for an API key, you can uncomment the mock data in the backend:

**File**: `/workspace/server/routes.ts` (lines 469-521)

The sync endpoint could return sample data for testing purposes.

---

## 📞 Need Help?

- **API-Football Docs**: https://www.api-football.com/documentation-v3
- **RapidAPI Support**: https://rapidapi.com/api-sports/api/api-football/discussions
- **Check API Status**: https://status.api-football.com/

---

**Once you have a valid API key, all football features will work automatically!** 🎉
