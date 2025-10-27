import { Button } from "@/components/ui/button";
import { TrendingUp, Shield, Zap } from "lucide-react";
import heroImage from "@assets/generated_images/Futuristic_sports_stadium_hero_0befccdc.png";

export function Hero() {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-background"></div>
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-sm mb-8">
          <Zap className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold text-primary">First Sports Prediction Market on Binance Chain</span>
        </div>
        
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 text-white">
          Predict. Compete. <span className="text-primary">Win.</span>
        </h1>
        
        <p className="text-xl sm:text-2xl text-white/90 mb-12 max-w-3xl mx-auto">
          The future of sports betting is here. Fully on-chain, AI-powered results, transparent settlements. 
          Built on Binance Smart Chain with dual token economics.
        </p>
        
        <div className="flex flex-wrap items-center justify-center gap-4 mb-16">
          <Button 
            size="lg" 
            className="text-lg px-8 h-12"
            data-testid="button-start-predicting"
            onClick={() => console.log('Navigate to markets')}
          >
            Start Predicting
          </Button>
          <Button 
            size="lg" 
            variant="outline" 
            className="text-lg px-8 h-12 bg-background/20 backdrop-blur-md border-white/20 text-white hover:bg-background/30"
            data-testid="button-how-it-works"
            onClick={() => console.log('Navigate to how it works')}
          >
            How It Works
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="flex flex-col items-center gap-3 p-6 rounded-xl bg-background/10 backdrop-blur-sm border border-white/10">
            <Shield className="w-8 h-8 text-primary" />
            <h3 className="font-semibold text-lg text-white">100% On-Chain</h3>
            <p className="text-sm text-white/70">Transparent, verifiable, trustless</p>
          </div>
          <div className="flex flex-col items-center gap-3 p-6 rounded-xl bg-background/10 backdrop-blur-sm border border-white/10">
            <TrendingUp className="w-8 h-8 text-primary" />
            <h3 className="font-semibold text-lg text-white">AI-Powered Results</h3>
            <p className="text-sm text-white/70">Automated, accurate settlements</p>
          </div>
          <div className="flex flex-col items-center gap-3 p-6 rounded-xl bg-background/10 backdrop-blur-sm border border-white/10">
            <Zap className="w-8 h-8 text-primary" />
            <h3 className="font-semibold text-lg text-white">Instant Payouts</h3>
            <p className="text-sm text-white/70">Get your winnings immediately</p>
          </div>
        </div>
      </div>
    </div>
  );
}
