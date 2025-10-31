/**
 * API-Football Service
 * Fetches live football match data, news, and fixtures from API-Football
 * Documentation: https://www.api-football.com/documentation-v3
 */

interface ApiFootballFixture {
  fixture: {
    id: number;
    referee: string | null;
    timezone: string;
    date: string;
    timestamp: number;
    venue: {
      id: number | null;
      name: string | null;
      city: string | null;
    };
    status: {
      long: string;
      short: string;
      elapsed: number | null;
    };
  };
  league: {
    id: number;
    name: string;
    country: string;
    logo: string;
    flag: string;
    season: number;
    round: string;
  };
  teams: {
    home: {
      id: number;
      name: string;
      logo: string;
      winner: boolean | null;
    };
    away: {
      id: number;
      name: string;
      logo: string;
      winner: boolean | null;
    };
  };
  goals: {
    home: number | null;
    away: number | null;
  };
  score: {
    halftime: {
      home: number | null;
      away: number | null;
    };
    fulltime: {
      home: number | null;
      away: number | null;
    };
  };
}

interface ApiFootballResponse<T> {
  get: string;
  parameters: Record<string, any>;
  errors: any[];
  results: number;
  paging?: {
    current: number;
    total: number;
  };
  response: T;
}

interface ApiFootballOdds {
  league: {
    id: number;
    name: string;
    country: string;
  };
  fixture: {
    id: number;
    date: string;
    timestamp: number;
  };
  bookmakers: Array<{
    id: number;
    name: string;
    bets: Array<{
      id: number;
      name: string;
      values: Array<{
        value: string;
        odd: string;
      }>;
    }>;
  }>;
}

interface ApiFootballStanding {
  league: {
    id: number;
    name: string;
    country: string;
    logo: string;
    flag: string;
    season: number;
    standings: Array<Array<{
      rank: number;
      team: {
        id: number;
        name: string;
        logo: string;
      };
      points: number;
      goalsDiff: number;
      group: string;
      form: string;
      status: string;
      description: string | null;
      all: {
        played: number;
        win: number;
        draw: number;
        lose: number;
        goals: {
          for: number;
          against: number;
        };
      };
    }>>;
  };
}

const API_KEY = process.env.API_FOOTBALL_KEY;
const BASE_URL = "https://v3.football.api-sports.io";

// Top football leagues to fetch data for
const SUPPORTED_LEAGUES = {
  39: { name: 'Premier League', country: 'England', season: 2025 },
  140: { name: 'La Liga', country: 'Spain', season: 2025 },
  78: { name: 'Bundesliga', country: 'Germany', season: 2025 },
  135: { name: 'Serie A', country: 'Italy', season: 2025 },
  61: { name: 'Ligue 1', country: 'France', season: 2025 },
  2: { name: 'UEFA Champions League', country: 'World', season: 2025 },
};

export class ApiFootballService {
  private async fetchFromApi<T>(endpoint: string, params: Record<string, any> = {}): Promise<T> {
    if (!API_KEY) {
      throw new Error("API_FOOTBALL_KEY environment variable not set");
    }

    const queryParams = new URLSearchParams(params as any).toString();
    const url = `${BASE_URL}${endpoint}${queryParams ? `?${queryParams}` : ''}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'x-apisports-key': API_KEY,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API-Football error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data: ApiFootballResponse<T> = await response.json();
    
    if (data.errors && data.errors.length > 0) {
      throw new Error(`API-Football errors: ${JSON.stringify(data.errors)}`);
    }

    return data.response;
  }

  /**
   * Get live fixtures currently in progress
   */
  async getLiveFixtures(): Promise<ApiFootballFixture[]> {
    try {
      return await this.fetchFromApi<ApiFootballFixture[]>('/fixtures', { live: 'all' });
    } catch (error) {
      console.error('Error fetching live fixtures:', error);
      return [];
    }
  }

  /**
   * Get upcoming fixtures for today and next 3 days (reduced from 7 to minimize API calls)
   */
  async getUpcomingFixtures(days = 3): Promise<ApiFootballFixture[]> {
    try {
      const allFixtures: ApiFootballFixture[] = [];
      const today = new Date();
      
      for (let i = 0; i < days; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() + i);
        const dateStr = date.toISOString().split('T')[0];
        
        // Fetch fixtures for each supported league
        for (const [leagueId, leagueInfo] of Object.entries(SUPPORTED_LEAGUES)) {
          try {
            const fixtures = await this.fetchFromApi<ApiFootballFixture[]>('/fixtures', {
              league: leagueId,
              season: leagueInfo.season,
              date: dateStr,
            });
            allFixtures.push(...fixtures);
          } catch (error) {
            console.error(`Error fetching fixtures for league ${leagueId}:`, error);
          }
        }
      }
      
      return allFixtures;
    } catch (error) {
      console.error('Error fetching upcoming fixtures:', error);
      return [];
    }
  }

  /**
   * Get odds for a specific fixture
   */
  async getFixtureOdds(fixtureId: number): Promise<ApiFootballOdds[]> {
    try {
      return await this.fetchFromApi<ApiFootballOdds[]>('/odds', {
        fixture: fixtureId,
        bookmaker: 2, // Bet365
      });
    } catch (error) {
      console.error(`Error fetching odds for fixture ${fixtureId}:`, error);
      return [];
    }
  }

  /**
   * Get league standings
   */
  async getLeagueStandings(leagueId: number, season: number): Promise<ApiFootballStanding[]> {
    try {
      return await this.fetchFromApi<ApiFootballStanding[]>('/standings', {
        league: leagueId,
        season: season,
      });
    } catch (error) {
      console.error(`Error fetching standings for league ${leagueId}:`, error);
      return [];
    }
  }

  /**
   * Get fixture details by ID
   */
  async getFixtureById(fixtureId: number): Promise<ApiFootballFixture | null> {
    try {
      const fixtures = await this.fetchFromApi<ApiFootballFixture[]>('/fixtures', {
        id: fixtureId,
      });
      return fixtures.length > 0 ? fixtures[0] : null;
    } catch (error) {
      console.error(`Error fetching fixture ${fixtureId}:`, error);
      return null;
    }
  }

  /**
   * Convert API-Football fixture to prediction market format
   */
  fixtureToMarketData(fixture: ApiFootballFixture, odds?: ApiFootballOdds): any {
    const commenceTime = new Date(fixture.fixture.date);
    const deadline = new Date(commenceTime.getTime() - 30 * 60 * 1000); // 30 min before

    let yesOdds = "50";
    let noOdds = "50";

    // Extract odds if available
    if (odds && odds.bookmakers.length > 0) {
      const matchWinnerBet = odds.bookmakers[0].bets.find(
        (bet) => bet.name === "Match Winner" || bet.id === 1
      );

      if (matchWinnerBet && matchWinnerBet.values.length >= 2) {
        const homeOdd = parseFloat(matchWinnerBet.values[0].odd);
        const awayOdd = parseFloat(matchWinnerBet.values.length > 2 ? matchWinnerBet.values[2].odd : matchWinnerBet.values[1].odd);

        // Convert decimal odds to implied probability
        const homeProb = (1 / homeOdd) * 100;
        const awayProb = (1 / awayOdd) * 100;
        const totalProb = homeProb + awayProb;

        // Normalize to 100%
        yesOdds = String(Math.round((homeProb / totalProb) * 100));
        noOdds = String(100 - parseInt(yesOdds));
      }
    }

    return {
      title: `${fixture.teams.home.name} vs ${fixture.teams.away.name}`,
      description: `Predict the winner of ${fixture.teams.home.name} vs ${fixture.teams.away.name} in ${fixture.league.name}. ${fixture.fixture.venue.name ? `Venue: ${fixture.fixture.venue.name}, ${fixture.fixture.venue.city}.` : ''} ${fixture.fixture.referee ? `Referee: ${fixture.fixture.referee}.` : ''}`,
      category: 'Soccer',
      sport: 'soccer',
      league: fixture.league.name,
      homeTeam: fixture.teams.home.name,
      awayTeam: fixture.teams.away.name,
      apiFootballFixtureId: String(fixture.fixture.id),
      startTime: commenceTime,
      deadline: deadline,
      yesOdds,
      noOdds,
      status: fixture.fixture.status.short === 'NS' ? 'upcoming' : 
              fixture.fixture.status.short === 'FT' ? 'completed' : 'live',
      metadata: {
        leagueId: fixture.league.id,
        leagueLogo: fixture.league.logo,
        homeTeamLogo: fixture.teams.home.logo,
        awayTeamLogo: fixture.teams.away.logo,
        venue: fixture.fixture.venue.name,
        city: fixture.fixture.venue.city,
        referee: fixture.fixture.referee,
        round: fixture.league.round,
      },
    };
  }

  /**
   * Get all upcoming football markets
   */
  async getAllFootballMarkets(): Promise<any[]> {
    try {
      // Get upcoming fixtures
      const fixtures = await this.getUpcomingFixtures(7);
      const markets: any[] = [];

      // Convert first 20 fixtures to market data
      for (const fixture of fixtures.slice(0, 20)) {
        // Skip if already started
        if (fixture.fixture.status.short !== 'NS') continue;

        // Try to fetch odds
        let odds: ApiFootballOdds | undefined;
        try {
          const oddsData = await this.getFixtureOdds(fixture.fixture.id);
          odds = oddsData.length > 0 ? oddsData[0] : undefined;
        } catch (error) {
          console.error(`Could not fetch odds for fixture ${fixture.fixture.id}`);
        }

        const marketData = this.fixtureToMarketData(fixture, odds);
        markets.push(marketData);
      }

      return markets;
    } catch (error) {
      console.error('Error getting all football markets:', error);
      return [];
    }
  }
}

export const apiFootballService = new ApiFootballService();
