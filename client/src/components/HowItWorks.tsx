import { Card } from "@/components/ui/card";
import { Wallet, TrendingUp, Shield, Trophy } from "lucide-react";

interface StepProps {
  number: number;
  icon: React.ReactNode;
  title: string;
  description: string;
}

function Step({ number, icon, title, description }: StepProps) {
  return (
    <Card className="p-8 relative overflow-hidden">
      <div className="absolute top-4 right-4 text-6xl font-bold text-primary/5">
        {number}
      </div>
      <div className="relative">
        <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
          {icon}
        </div>
        <h3 className="text-xl font-semibold mb-3">{title}</h3>
        <p className="text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </Card>
  );
}

export function HowItWorks() {
  return (
    <div className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            How It Works
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Get started in minutes. Simple, transparent, and fully decentralized.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Step
            number={1}
            icon={<Wallet className="w-6 h-6 text-primary" />}
            title="Connect Wallet"
            description="Link your Web3 wallet using WalletConnect. Support for MetaMask, Trust Wallet, and more."
          />
          <Step
            number={2}
            icon={<TrendingUp className="w-6 h-6 text-primary" />}
            title="Choose Market"
            description="Browse sports predictions for NBA, FIFA, eSports, and more. Review odds and potential returns."
          />
          <Step
            number={3}
            icon={<Shield className="w-6 h-6 text-primary" />}
            title="Place Your Bet"
            description="Stake BNB or BNBALL tokens. All funds secured in smart contract escrow vault."
          />
          <Step
            number={4}
            icon={<Trophy className="w-6 h-6 text-primary" />}
            title="Collect Winnings"
            description="AI-powered oracle verifies results. Winners receive instant payouts to their wallet."
          />
        </div>
      </div>
    </div>
  );
}
