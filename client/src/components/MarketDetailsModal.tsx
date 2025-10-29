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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, TrendingUp, Info, AlertCircle, Loader2, ExternalLink, CheckCircle2, HelpCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatDistanceToNow } from "date-fns";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { usePlaceBet, useClaimWinnings } from "@/hooks/usePredictionMarket";
import { useWeb3 } from "@/hooks/useWeb3";
import { validateBetAmount, formatBNB, toBNBWei, formatBetSplit } from "@/utils/blockchain";
import { getExplorerUrl, BET_CONFIG, isContractDeployed, ESCROW_WALLET_ADDRESS, TAX_CONFIG, getAddressExplorerUrl } from "@/lib/contractConfig";
import { useChainId } from "wagmi";
import { ConfigurationAlert } from "./ConfigurationAlert";

interface MarketDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  market: {
    id: string;
    title: string;
    category: string;
    status: "live" | "upcoming" | "completed";
    deadline: Date;
    yesOdds: number;
    noOdds: number;
    totalPool: string;
    participants: number;
    resolutionMethod?: string;
    result?: string;
    description?: string;
  };
}

export function MarketDetailsModal({ open, onOpenChange, market }: MarketDetailsModalProps) {
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
  
  const {
    claimWinnings,
    isLoading: isClaimingWinnings,
    isSuccess: claimSuccess,
    txHash: claimTxHash
  } = useClaimWinnings();

  const contractDeployed = isContractDeployed(chainId);

  const calculatePotentialReturn = () => {
    if (!betAmount || isNaN(parseFloat(betAmount))) return "0.00";
    const amount = parseFloat(betAmount);
    // Potential return is calculated based on the pool amount (99%) that actually goes to the bet
    const poolAmount = amount * TAX_CONFIG.BET_POOL_DECIMAL;
    const odds = selectedOption === "yes" ? market.yesOdds : market.noOdds;
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

    if (!contractDeployed) {
      toast({
        title: "Contract Not Deployed",
        description: "The prediction market contract is not yet deployed on this network. Please check the documentation for deployment instructions.",
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

  const handleClaimWinnings = async () => {
    if (!isConnected) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to claim winnings",
        variant: "destructive",
      });
      connect();
      return;
    }

    if (!contractDeployed) {
      toast({
        title: "Contract Not Deployed",
        description: "The prediction market contract is not yet deployed on this network.",
        variant: "destructive",
      });
      return;
    }

    await claimWinnings(market.id);
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
    if (!contractDeployed) return "Contract Not Deployed";
    if (market.status !== "live") return "Market Not Active";
    
    if (currentStep === 'tax') return "Step 1/2: Confirming Tax Payment...";
    if (currentStep === 'bet') return "Step 2/2: Confirming Bet Placement...";
    if (currentStep === 'complete') return "Bet Placed Successfully!";
    
    return "Start Bet (2 Transactions Required)";
  };

  const isButtonDisabled = () => {
    if (isPlacingBet) return true;
    if (market.status !== "live") return true;
    if (!betAmount || parseFloat(betAmount) <= 0) return true;
    return false;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline" className="text-xs">
              {market.category}
            </Badge>
            <Badge 
              className={
                market.status === "live" 
                  ? "bg-green-500/10 text-green-500 border-green-500/20"
                  : market.status === "upcoming"
                  ? "bg-blue-500/10 text-blue-500 border-blue-500/20"
                  : "bg-muted text-muted-foreground"
              }
            >
              {market.status.toUpperCase()}
            </Badge>
          </div>
          <DialogTitle className="text-xl" data-testid="text-modal-title">
            {market.title}
          </DialogTitle>
          <DialogDescription>
            {market.description || "Place your prediction and compete with other traders"}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="bet" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="bet" data-testid="tab-place-bet">Place Bet</TabsTrigger>
            <TabsTrigger value="details" data-testid="tab-details">Details</TabsTrigger>
            <TabsTrigger value="activity" data-testid="tab-activity">Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="bet" className="space-y-4 mt-4">
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
                <div className="text-xs text-muted-foreground mb-1">YES</div>
                <div className="text-2xl font-mono font-bold text-green-500">
                  {market.yesOdds.toFixed(1)}%
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  +{(100 / market.yesOdds * 100 - 100).toFixed(0)}% return
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
                <div className="text-xs text-muted-foreground mb-1">NO</div>
                <div className="text-2xl font-mono font-bold text-red-500">
                  {market.noOdds.toFixed(1)}%
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  +{(100 / market.noOdds * 100 - 100).toFixed(0)}% return
                </div>
              </button>
            </div>

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

            <div className="bg-muted/50 p-4 rounded-lg space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Your Prediction</span>
                <span className="font-semibold">{selectedOption.toUpperCase()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Potential Return</span>
                <span className="font-mono font-semibold" data-testid="text-potential-return">
                  {calculatePotentialReturn()} BNB
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Current Odds</span>
                <span className="font-mono">
                  {selectedOption === "yes" ? market.yesOdds : market.noOdds}%
                </span>
              </div>
            </div>

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

            <div className="bg-muted/50 p-3 rounded-lg">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Est. Gas Fee</span>
                <span className="font-mono text-xs">
                  ~{gasEstimate} BNB
                </span>
              </div>
            </div>

            {contractDeployed && (
              <div className="flex items-start gap-2 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-muted-foreground">
                  This will create a real blockchain transaction on BSC {chainId === 56 ? 'Mainnet' : 'Testnet'}. 
                  You'll need to confirm the transaction in your wallet and pay gas fees.
                </p>
              </div>
            )}

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

            {market.status === "completed" && market.result && (
              <Button 
                className="w-full" 
                size="lg"
                variant="outline"
                disabled={isClaimingWinnings || !contractDeployed}
                onClick={handleClaimWinnings}
                data-testid="button-claim-winnings"
              >
                {isClaimingWinnings && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isClaimingWinnings ? "Claiming Winnings..." : "Claim Winnings"}
              </Button>
            )}

            {claimTxHash && (
              <div className="flex items-start gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                <Info className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground mb-1">
                    Winnings claimed successfully!
                  </p>
                  <a 
                    href={getExplorerUrl(chainId, claimTxHash)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-green-500 hover:underline flex items-center gap-1"
                  >
                    View on BSCScan <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="details" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-muted-foreground mb-1">Total Pool</div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  <span className="font-mono font-semibold text-lg">{market.totalPool} BNB</span>
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">Participants</div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" />
                  <span className="font-semibold text-lg">{market.participants}</span>
                </div>
              </div>
            </div>

            <div>
              <div className="text-xs text-muted-foreground mb-1">Deadline</div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                <span className="text-sm">
                  {market.status === "completed" 
                    ? "Ended" 
                    : formatDistanceToNow(market.deadline, { addSuffix: true })}
                </span>
              </div>
            </div>

            <div>
              <div className="text-xs text-muted-foreground mb-1">Resolution Method</div>
              <p className="text-sm">{market.resolutionMethod || "Chainlink Oracle + AI Verification"}</p>
            </div>

            {market.result && (
              <div className="p-4 bg-muted/50 rounded-lg border">
                <div className="text-xs font-semibold text-muted-foreground mb-2">FINAL RESULT</div>
                <p className="text-sm">{market.result}</p>
              </div>
            )}

            <div className="flex items-start gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
              <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-muted-foreground">
                All bets are final once placed. Markets are resolved automatically using verified oracle data. 
                Dispute resolution is available through community governance.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="activity" className="space-y-3 mt-4">
            <div className="text-sm text-muted-foreground mb-4">
              Recent betting activity {!contractDeployed && "(demo data - connect to blockchain for real data)"}
            </div>
            {[
              { user: "0x7a2b...3d4e", prediction: "YES", amount: "2.5 BNB", time: "2 min ago" },
              { user: "0x9f1c...8b2a", prediction: "NO", amount: "1.8 BNB", time: "5 min ago" },
              { user: "0x3e4f...1c9d", prediction: "YES", amount: "4.2 BNB", time: "12 min ago" },
              { user: "0x6d8a...7f3b", prediction: "NO", amount: "0.9 BNB", time: "18 min ago" },
            ].map((activity, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <div className="flex items-center gap-3">
                  <code className="text-xs font-mono">{activity.user}</code>
                  <Badge 
                    variant="outline" 
                    className={activity.prediction === "YES" ? "text-green-500" : "text-red-500"}
                  >
                    {activity.prediction}
                  </Badge>
                </div>
                <div className="text-right">
                  <div className="text-sm font-mono font-semibold">{activity.amount}</div>
                  <div className="text-xs text-muted-foreground">{activity.time}</div>
                </div>
              </div>
            ))}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
