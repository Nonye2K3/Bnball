import { Card } from "@/components/ui/card";
import { Coins, TrendingUp, Users, Zap } from "lucide-react";

export function Tokenomics() {
  return (
    <div className="py-24 bg-muted/30" id="tokenomics">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Dual Token Economics
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Built on a sustainable dual-token model combining BNB liquidity with BNBALL utility
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <Card className="p-8 bg-gradient-to-br from-primary/10 to-primary/5">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-lg bg-primary/20">
                <Coins className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-2xl font-bold">BNB Token</h3>
            </div>
            
            <p className="text-muted-foreground mb-6">
              Primary betting currency with instant liquidity and wide acceptance across BSC ecosystem.
            </p>
            
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <Zap className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-sm">Place bets on any market</span>
              </li>
              <li className="flex items-start gap-2">
                <Zap className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-sm">Instant settlements and withdrawals</span>
              </li>
              <li className="flex items-start gap-2">
                <Zap className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-sm">Lower gas fees on BSC network</span>
              </li>
            </ul>
          </Card>
          
          <Card className="p-8 bg-gradient-to-br from-secondary/10 to-secondary/5">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-lg bg-secondary/20">
                <TrendingUp className="w-6 h-6 text-secondary" />
              </div>
              <h3 className="text-2xl font-bold">BNBALL Token</h3>
            </div>
            
            <p className="text-muted-foreground mb-6">
              Platform utility token with governance rights, staking rewards, and exclusive benefits.
            </p>
            
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <Zap className="w-5 h-5 text-secondary mt-0.5 flex-shrink-0" />
                <span className="text-sm">Reduced platform fees (0.5% vs 2%)</span>
              </li>
              <li className="flex items-start gap-2">
                <Zap className="w-5 h-5 text-secondary mt-0.5 flex-shrink-0" />
                <span className="text-sm">Governance voting on new features</span>
              </li>
              <li className="flex items-start gap-2">
                <Zap className="w-5 h-5 text-secondary mt-0.5 flex-shrink-0" />
                <span className="text-sm">Stake to earn yield from platform fees</span>
              </li>
            </ul>
          </Card>
        </div>
        
        <Card className="p-8">
          <h3 className="text-xl font-semibold mb-6">Token Distribution</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <Users className="w-8 h-8 text-primary mx-auto mb-3" />
              <div className="text-3xl font-bold font-mono mb-2">40%</div>
              <div className="text-sm text-muted-foreground">Community & Rewards</div>
            </div>
            <div className="text-center">
              <TrendingUp className="w-8 h-8 text-primary mx-auto mb-3" />
              <div className="text-3xl font-bold font-mono mb-2">30%</div>
              <div className="text-sm text-muted-foreground">Liquidity Pool</div>
            </div>
            <div className="text-center">
              <Zap className="w-8 h-8 text-primary mx-auto mb-3" />
              <div className="text-3xl font-bold font-mono mb-2">30%</div>
              <div className="text-sm text-muted-foreground">Team & Development</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
