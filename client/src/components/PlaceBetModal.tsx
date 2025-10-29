import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, ExternalLink, CheckCircle2, HelpCircle, Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { usePlaceBet } from "@/hooks/usePredictionMarket";
import { useWeb3 } from "@/hooks/useWeb3";
import { validateBetAmount, toBNBWei, formatBetSplit } from "@/utils/blockchain";
import { getExplorerUrl, BET_CONFIG, ESCROW_WALLET_ADDRESS, TAX_CONFIG, getAddressExplorerUrl } from "@/lib/contractConfig";
import { useChainId } from "wagmi";
import { ConfigurationAlert } from "./ConfigurationAlert";
import type { PredictionMarket } from "@shared/schema";

interface PlaceBetModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  market: PredictionMarket;
}

export function PlaceBetModal({ open, onOpenChange, market }: PlaceBetModalProps) {
  const [betAmount, setBetAmount] = useState("");
  const [selectedOption, setSelectedOption] = useState<"yes" | "no">("yes");
  const { toast } = useToast();
  const chainId = useChainId();
  
  const { isConnected, connect, formattedBalance } = useWeb3();
  const { 
    placeBet, 
    isLoading: isPlacingBet, 
    isSuccess: betSuccess,
    txHash: betTxHash,
    escrowTxHash,
    gasEstimate,
    betSplit,
    currentStep
  } = usePlaceBet();

  const yesOdds = parseFloat(market.yesOdds);
  const noOdds = parseFloat(market.noOdds);

  const calculatePotentialReturn = () => {
    if (!betAmount || isNaN(parseFloat(betAmount))) return "0.00";
    const amount = parseFloat(betAmount);
    const poolAmount = amount * TAX_CONFIG.BET_POOL_DECIMAL;
    const odds = selectedOption === "yes" ? yesOdds : noOdds;
    const multiplier = 100 / odds;
    return (poolAmount * multiplier).toFixed(3);
  };

  const getBetBreakdown = () => {
    if (!betAmount || isNaN(parseFloat(betAmount))) {
      return { total: "0", pool: "0", tax: "0" };
    }
    try {
      const totalWei = toBNBWei(betAmount);
      return formatBetSplit(totalWei);
    } catch {
      return { total: "0", pool: "0", tax: "0" };
    }
  };

  const breakdown = getBetBreakdown();

  const handlePlaceBet = async () => {
    if (!isConnected) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to place a bet",
        variant: "destructive",
      });
      connect();
      return;
    }

    // Check if market has been deployed on-chain
    if (!market.contractMarketId || market.contractMarketId === 0) {
      toast({
        title: "Market Not Deployed",
        description: "This market has not been deployed on the blockchain yet. Only deployed markets accept bets. Live sports markets from TheOddsAPI are for demonstration purposes only.",
        variant: "destructive",
      });
      return;
    }

    const validation = validateBetAmount(betAmount);
    if (!validation.isValid) {
      toast({
        title: "Invalid Bet Amount",
        description: validation.error,
        variant: "destructive",
      });
      return;
    }

    const prediction = selectedOption === "yes";
    
    await placeBet(market.id, prediction, betAmount);
  };

  useEffect(() => {
    if (betSuccess) {
      setBetAmount("");
      setTimeout(() => {
        onOpenChange(false);
      }, 2000);
    }
  }, [betSuccess, onOpenChange]);

  const getButtonText = () => {
    if (!isConnected) return "Connect Wallet to Bet";
    if (market.status !== 'live') return "Market Not Active";
    
    if (currentStep === 'tax') return "Step 1/2: Confirming Tax Payment...";
    if (currentStep === 'bet') return "Step 2/2: Confirming Bet Placement...";
    if (currentStep === 'complete') return "Bet Placed Successfully!";
    
    return "Confirm Bet (2 Transactions Required)";
  };

  const isButtonDisabled = () => {
    if (isPlacingBet) return true;
    if (market.status !== 'live') return true;
    if (!betAmount || parseFloat(betAmount) <= 0) return true;
    return false;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            {market.league && (
              <Badge variant="outline" className="text-xs font-bold">
                {market.league}
              </Badge>
            )}
            <Badge 
              className={
                market.status === "live" 
                  ? "bg-green-500/10 text-green-500 border-green-500/20"
                  : "bg-muted text-muted-foreground"
              }
            >
              {market.status.toUpperCase()}
            </Badge>
          </div>
          <DialogTitle className="text-xl" data-testid="text-modal-title">
            {market.homeTeam && market.awayTeam 
              ? `${market.homeTeam} vs ${market.awayTeam}`
              : market.title
            }
          </DialogTitle>
          <DialogDescription>
            {market.description || "Place your prediction and compete with other traders"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <ConfigurationAlert variant="compact" showTitle={false} />
          
          {/* Transaction Progress Indicator */}
          {currentStep !== 'idle' && (
            <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 p-4 rounded-lg space-y-3">
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-2">
                  PROCESSING YOUR BET
                </div>
              </div>
              
              <div className="space-y-2">
                {/* Step 1: Processing */}
                <div className={`flex items-center gap-3 p-2 rounded ${
                  currentStep === 'tax' ? 'bg-blue-500/20' : 
                  (currentStep === 'bet' || currentStep === 'complete') ? 'bg-green-500/10' : 
                  'bg-muted/30'
                }`}>
                  <div className="flex-shrink-0">
                    {currentStep === 'tax' ? (
                      <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                    ) : (currentStep === 'bet' || currentStep === 'complete') ? (
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border-2 border-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-semibold">Step 1/2: Confirming Transaction</div>
                    <div className="text-xs text-muted-foreground">
                      Processing your bet...
                    </div>
                  </div>
                </div>
                
                {/* Step 2: Placing Bet */}
                <div className={`flex items-center gap-3 p-2 rounded ${
                  currentStep === 'bet' ? 'bg-blue-500/20' : 
                  currentStep === 'complete' ? 'bg-green-500/10' : 
                  'bg-muted/30'
                }`}>
                  <div className="flex-shrink-0">
                    {currentStep === 'bet' ? (
                      <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                    ) : currentStep === 'complete' ? (
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border-2 border-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-semibold">Step 2/2: Finalizing Bet</div>
                    <div className="text-xs text-muted-foreground">
                      Submitting to betting pool...
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Prediction Options */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setSelectedOption("yes")}
              className={`p-4 rounded-lg border-2 transition-all ${
                selectedOption === "yes"
                  ? "border-green-500 bg-green-500/10"
                  : "border-border hover:border-green-500/50"
              }`}
              data-testid="button-select-yes"
            >
              <div className="text-xs text-muted-foreground mb-1">
                {market.homeTeam || 'YES'}
              </div>
              <div className="text-2xl font-mono font-bold text-green-500">
                {yesOdds.toFixed(1)}%
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                +{(100 / yesOdds * 100 - 100).toFixed(0)}% return
              </div>
            </button>
            <button
              onClick={() => setSelectedOption("no")}
              className={`p-4 rounded-lg border-2 transition-all ${
                selectedOption === "no"
                  ? "border-red-500 bg-red-500/10"
                  : "border-border hover:border-red-500/50"
              }`}
              data-testid="button-select-no"
            >
              <div className="text-xs text-muted-foreground mb-1">
                {market.awayTeam || 'NO'}
              </div>
              <div className="text-2xl font-mono font-bold text-red-500">
                {noOdds.toFixed(1)}%
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                +{(100 / noOdds * 100 - 100).toFixed(0)}% return
              </div>
            </button>
          </div>

          {/* Bet Amount Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="bet-amount">Bet Amount (BNB)</Label>
              {isConnected && formattedBalance && (
                <span className="text-xs text-muted-foreground">
                  Balance: {formattedBalance}
                </span>
              )}
            </div>
            <Input
              id="bet-amount"
              type="number"
              step="0.001"
              min={BET_CONFIG.MIN_BET_AMOUNT_DISPLAY}
              placeholder={`Min: ${BET_CONFIG.MIN_BET_AMOUNT_DISPLAY} BNB`}
              value={betAmount}
              onChange={(e) => setBetAmount(e.target.value)}
              disabled={isPlacingBet}
              data-testid="input-bet-amount"
            />
            <p className="text-xs text-muted-foreground">
              Minimum bet: {BET_CONFIG.MIN_BET_AMOUNT_DISPLAY} BNB
            </p>
          </div>

          {/* Potential Return Summary */}
          <div className="bg-muted/50 p-4 rounded-lg space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Your Prediction</span>
              <span className="font-semibold">{selectedOption.toUpperCase()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Potential Return</span>
              <span className="font-mono font-semibold text-green-500" data-testid="text-potential-return">
                {calculatePotentialReturn()} BNB
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Current Odds</span>
              <span className="font-mono">
                {selectedOption === "yes" ? yesOdds : noOdds}%
              </span>
            </div>
          </div>

          {/* Bet Summary */}
          {betAmount && parseFloat(betAmount) > 0 && (
            <div className="bg-blue-500/5 border border-blue-500/20 p-4 rounded-lg">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Your Bet Amount</span>
                <span className="font-mono font-semibold text-lg" data-testid="text-total-bet">
                  {breakdown.total} BNB
                </span>
              </div>
            </div>
          )}

          {/* Gas Estimate */}
          <div className="bg-muted/50 p-3 rounded-lg">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Est. Gas Fee</span>
              <span className="font-mono text-xs">
                ~{gasEstimate} BNB
              </span>
            </div>
          </div>

          {/* Transaction Links */}
          {betTxHash && (
            <div className="flex items-start gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
              <Info className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-muted-foreground mb-1">
                  Bet transaction submitted successfully!
                </p>
                <a 
                  href={getExplorerUrl(chainId, betTxHash)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-green-500 hover:underline flex items-center gap-1"
                  data-testid="link-bet-tx"
                >
                  View Bet Tx on BSCScan <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          )}

          {escrowTxHash && (
            <div className="flex items-start gap-2 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-muted-foreground mb-1">
                  Escrow tax transaction submitted successfully!
                </p>
                <a 
                  href={getExplorerUrl(chainId, escrowTxHash)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-500 hover:underline flex items-center gap-1"
                  data-testid="link-escrow-tx"
                >
                  View Escrow Tx on BSCScan <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          )}

          {/* Place Bet Button */}
          <Button 
            className="w-full" 
            size="lg"
            disabled={isButtonDisabled()}
            onClick={isConnected ? handlePlaceBet : connect}
            data-testid="button-confirm-bet"
          >
            {isPlacingBet && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {getButtonText()}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
