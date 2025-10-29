import type { PredictionMarket } from "@shared/schema";

interface OddsApiEvent {
  id: string;
  sport_key: string;
  sport_title: string;
  commence_time: string;
  home_team: string;
  away_team: string;
  bookmakers?: Array<{
    key: string;
    title: string;
    markets: Array<{
      key: string;
      outcomes: Array<{
        name: string;
        price: number;
      }>;
    }>;
  }>;
}

interface OddsApiOdds {
  id: string;
  sport_key: string;
  sport_title: string;
  commence_time: string;
  home_team: string;
  away_team: string;
  bookmakers: Array<{
    key: string;
    title: string;
    markets: Array<{
      key: string;
      outcomes: Array<{
        name: string;
        price: number;
      }>;
    }>;
  }>;
}

const ODDS_API_KEY = process.env.THEODDSAPI_KEY;
const ODDS_API_BASE = "https://api.the-odds-api.com/v4";

// Sports we support
const SUPPORTED_SPORTS = {
  'basketball_nba': { title: 'NBA', category: 'Basketball', league: 'NBA' },
  'americanfootball_nfl': { title: 'NFL', category: 'American Football', league: 'NFL' },
  'soccer_epl': { title: 'English Premier League', category: 'Soccer', league: 'EPL' },
  'soccer_uefa_champs_league': { title: 'UEFA Champions League', category: 'Soccer', league: 'UEFA' },
  'soccer_spain_la_liga': { title: 'La Liga', category: 'Soccer', league: 'La Liga' },
  'mma_mixed_martial_arts': { title: 'MMA', category: 'Combat Sports', league: 'MMA' },
  'boxing_boxing': { title: 'Boxing', category: 'Combat Sports', league: 'Boxing' },
};

export class OddsApiService {
  private async fetchFromApi(endpoint: string): Promise<any> {
    if (!ODDS_API_KEY) {
      throw new Error("THEODDSAPI_KEY environment variable not set");
    }

    const url = `${ODDS_API_BASE}${endpoint}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`OddsAPI error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async getUpcomingMatches(sport: string, region = 'us'): Promise<OddsApiOdds[]> {
    const endpoint = `/sports/${sport}/odds?apiKey=${ODDS_API_KEY}&regions=${region}&markets=h2h&oddsFormat=decimal`;
    return this.fetchFromApi(endpoint);
  }

  async getAllUpcomingMatches(region = 'us'): Promise<Partial<PredictionMarket>[]> {
    const allMatches: Partial<PredictionMarket>[] = [];

    for (const [sportKey, sportInfo] of Object.entries(SUPPORTED_SPORTS)) {
      try {
        const odds = await this.getUpcomingMatches(sportKey, region);
        
        for (const event of odds) {
          // Find bookmaker with best odds (use first available)
          const bookmaker = event.bookmakers[0];
          if (!bookmaker) continue;

          // Get head-to-head market
          const h2hMarket = bookmaker.markets.find(m => m.key === 'h2h');
          if (!h2hMarket || h2hMarket.outcomes.length < 2) continue;

          const homeOutcome = h2hMarket.outcomes.find(o => o.name === event.home_team);
          const awayOutcome = h2hMarket.outcomes.find(o => o.name === event.away_team);

          if (!homeOutcome || !awayOutcome) continue;

          // Convert decimal odds to implied probability percentage
          const homeProb = (1 / homeOutcome.price) * 100;
          const awayProb = (1 / awayOutcome.price) * 100;
          const totalProb = homeProb + awayProb;
          
          // Normalize to 100% and round
          const normalizedHomeOdds = Math.round((homeProb / totalProb) * 100);
          const normalizedAwayOdds = 100 - normalizedHomeOdds;

          const commenceTime = new Date(event.commence_time);
          // Market closes 30 minutes before match starts
          const deadline = new Date(commenceTime.getTime() - 30 * 60 * 1000);

          allMatches.push({
            title: `${event.home_team} vs ${event.away_team}`,
            description: `Predict the winner of ${event.home_team} vs ${event.away_team} in ${sportInfo.title}`,
            category: sportInfo.category,
            sport: sportKey,
            league: sportInfo.league,
            homeTeam: event.home_team,
            awayTeam: event.away_team,
            oddsApiEventId: event.id,
            bookmaker: bookmaker.key,
            startTime: commenceTime,
            deadline: deadline,
            yesOdds: String(normalizedHomeOdds),
            noOdds: String(normalizedAwayOdds),
            resolutionMethod: 'chainlink_oracle',
            status: deadline > new Date() ? 'live' : 'upcoming',
            lastOddsUpdate: new Date(),
          });
        }
      } catch (error) {
        console.error(`Failed to fetch odds for ${sportKey}:`, error);
      }
    }

    return allMatches;
  }

  async getEventOdds(eventId: string, sport: string): Promise<OddsApiOdds | null> {
    try {
      const endpoint = `/sports/${sport}/odds?apiKey=${ODDS_API_KEY}&regions=us&markets=h2h&oddsFormat=decimal&eventIds=${eventId}`;
      const odds = await this.fetchFromApi(endpoint);
      return odds[0] || null;
    } catch (error) {
      console.error(`Failed to fetch odds for event ${eventId}:`, error);
      return null;
    }
  }

  async updateMarketOdds(market: Partial<PredictionMarket>): Promise<Partial<PredictionMarket> | null> {
    if (!market.oddsApiEventId || !market.sport) {
      return null;
    }

    const event = await this.getEventOdds(market.oddsApiEventId, market.sport);
    if (!event || !event.bookmakers || event.bookmakers.length === 0) {
      return null;
    }

    const bookmaker = event.bookmakers[0];
    const h2hMarket = bookmaker.markets.find(m => m.key === 'h2h');
    if (!h2hMarket || h2hMarket.outcomes.length < 2) {
      return null;
    }

    const homeOutcome = h2hMarket.outcomes.find(o => o.name === event.home_team);
    const awayOutcome = h2hMarket.outcomes.find(o => o.name === event.away_team);

    if (!homeOutcome || !awayOutcome) {
      return null;
    }

    const homeProb = (1 / homeOutcome.price) * 100;
    const awayProb = (1 / awayOutcome.price) * 100;
    const totalProb = homeProb + awayProb;
    
    const normalizedHomeOdds = Math.round((homeProb / totalProb) * 100);
    const normalizedAwayOdds = 100 - normalizedHomeOdds;

    return {
      ...market,
      yesOdds: String(normalizedHomeOdds),
      noOdds: String(normalizedAwayOdds),
      lastOddsUpdate: new Date(),
    };
  }
}

export const oddsApiService = new OddsApiService();
