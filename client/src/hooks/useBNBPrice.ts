import { useQuery } from "@tanstack/react-query";

interface CoinGeckoPriceResponse {
  binancecoin: {
    usd: number;
  };
}

export function useBNBPrice() {
  return useQuery<number>({
    queryKey: ['/api/bnb-price'],
    queryFn: async () => {
      const response = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=binancecoin&vs_currencies=usd'
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch BNB price');
      }
      
      const data: CoinGeckoPriceResponse = await response.json();
      return data.binancecoin.usd;
    },
    staleTime: 60000,
    refetchInterval: 60000,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}
