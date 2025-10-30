import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, ExternalLink, Terminal, Info } from "lucide-react";
import { useChainId } from "wagmi";
import { isContractDeployed, getContractAddress, getAddressExplorerUrl, PLATFORM_FEE_RECIPIENT } from "@/lib/contractConfig";
import { projectId } from "@/lib/web3Config";

interface ConfigurationAlertProps {
  variant?: "default" | "compact";
  showTitle?: boolean;
}

export function ConfigurationAlert({ variant = "default", showTitle = true }: ConfigurationAlertProps) {
  const chainId = useChainId();
  const contractDeployed = isContractDeployed(chainId);
  const walletConnectConfigured = projectId !== 'YOUR_WALLETCONNECT_PROJECT_ID';

  const allConfigured = contractDeployed && walletConnectConfigured;

  if (allConfigured && variant === "compact") {
    return null;
  }

  if (variant === "compact") {
    return (
      <div className="space-y-2">
        {!contractDeployed && (
          <Alert variant="destructive" data-testid="alert-contract-not-deployed">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Contract Not Deployed</AlertTitle>
            <AlertDescription className="text-xs">
              The smart contract is not deployed. Betting is disabled.{" "}
              <a 
                href="https://docs.bnball.app/deployment" 
                target="_blank" 
                rel="noopener noreferrer"
                className="underline font-medium inline-flex items-center gap-1"
              >
                View deployment guide <ExternalLink className="w-3 h-3" />
              </a>
            </AlertDescription>
          </Alert>
        )}
        
        {!walletConnectConfigured && (
          <Alert className="border-amber-500/50 bg-amber-500/10" data-testid="alert-walletconnect-missing">
            <AlertCircle className="h-4 w-4 text-amber-500" />
            <AlertTitle className="text-amber-500">WalletConnect Not Configured</AlertTitle>
            <AlertDescription className="text-xs">
              Get a Project ID from{" "}
              <a 
                href="https://cloud.walletconnect.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="underline font-medium text-amber-500 inline-flex items-center gap-1"
              >
                WalletConnect Cloud <ExternalLink className="w-3 h-3" />
              </a>
            </AlertDescription>
          </Alert>
        )}
      </div>
    );
  }

  return (
    <Alert 
      variant={allConfigured ? "default" : "destructive"} 
      className={allConfigured ? "border-green-500/50 bg-green-500/10" : ""}
      data-testid="alert-configuration-status"
    >
      {allConfigured ? (
        <CheckCircle className="h-4 w-4 text-green-500" />
      ) : (
        <AlertCircle className="h-4 w-4" />
      )}
      
      {showTitle && (
        <AlertTitle className={allConfigured ? "text-green-500" : ""}>
          {allConfigured ? "✓ Configuration Complete" : "⚠️ Configuration Required"}
        </AlertTitle>
      )}
      
      <AlertDescription>
        {allConfigured ? (
          <div className="space-y-3">
            <p className="text-sm">All systems are configured and ready for mainnet:</p>
            <div className="flex flex-wrap gap-2 mt-2">
              <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                <CheckCircle className="w-3 h-3 mr-1" />
                Smart Contract Deployed
              </Badge>
              <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                <CheckCircle className="w-3 h-3 mr-1" />
                WalletConnect Configured
              </Badge>
            </div>
            <div className="bg-blue-500/10 border border-blue-500/20 p-3 rounded-lg space-y-2">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <p className="text-xs font-semibold text-blue-500">Contract Information</p>
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Network:</span>
                      <span className="font-mono font-semibold">{chainId === 56 ? 'BSC Mainnet' : 'BSC Testnet'}</span>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-muted-foreground">Contract:</span>
                      <code className="bg-muted px-1.5 py-0.5 rounded font-mono text-xs">{getContractAddress(chainId)}</code>
                      <a 
                        href={getAddressExplorerUrl(chainId, getContractAddress(chainId))}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline inline-flex items-center gap-1"
                        data-testid="link-contract-bscscan"
                      >
                        View on BSCScan <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-muted-foreground">Admin Wallet:</span>
                      <code className="bg-muted px-1.5 py-0.5 rounded font-mono text-xs">{PLATFORM_FEE_RECIPIENT}</code>
                      <a 
                        href={getAddressExplorerUrl(chainId, PLATFORM_FEE_RECIPIENT)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline inline-flex items-center gap-1"
                        data-testid="link-admin-wallet-bscscan"
                      >
                        View on BSCScan <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm font-medium">
              The following configuration items need attention:
            </p>

            <div className="space-y-3">
              {!contractDeployed && (
                <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-3 space-y-2">
                  <div className="flex items-start gap-2">
                    <Terminal className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold mb-1">Smart Contract Not Deployed</p>
                      <p className="text-xs text-muted-foreground mb-2">
                        Contract address: <code className="bg-muted px-1 py-0.5 rounded text-xs">{getContractAddress(chainId)}</code>
                      </p>
                      <p className="text-xs text-muted-foreground mb-2">
                        The PredictionMarket smart contract must be deployed before users can place bets.
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="h-7 text-xs"
                          asChild
                        >
                          <a 
                            href="https://docs.bnball.app/deployment" 
                            target="_blank" 
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="w-3 h-3 mr-1" />
                            Deployment Guide
                          </a>
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="h-7 text-xs"
                          asChild
                        >
                          <a 
                            href="https://remix.ethereum.org" 
                            target="_blank" 
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="w-3 h-3 mr-1" />
                            Deploy with Remix
                          </a>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {!walletConnectConfigured && (
                <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 space-y-2">
                  <div className="flex items-start gap-2">
                    <Terminal className="w-4 h-4 mt-0.5 flex-shrink-0 text-amber-500" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold mb-1 text-amber-500">WalletConnect Project ID Missing</p>
                      <p className="text-xs text-muted-foreground mb-2">
                        Current value: <code className="bg-muted px-1 py-0.5 rounded text-xs">{projectId}</code>
                      </p>
                      <p className="text-xs text-muted-foreground mb-2">
                        Mobile wallet connections require a WalletConnect Project ID. This is free and takes 2 minutes to set up.
                      </p>
                      <div className="space-y-2">
                        <ol className="text-xs text-muted-foreground list-decimal list-inside space-y-1">
                          <li>Visit <a href="https://cloud.walletconnect.com/" target="_blank" rel="noopener noreferrer" className="text-amber-500 hover:underline">WalletConnect Cloud</a></li>
                          <li>Create a free account and project</li>
                          <li>Copy your Project ID</li>
                          <li>Add to .env file: <code className="bg-muted px-1 py-0.5 rounded">VITE_WALLETCONNECT_PROJECT_ID=your_id</code></li>
                        </ol>
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="h-7 text-xs"
                          asChild
                        >
                          <a 
                            href="https://cloud.walletconnect.com/" 
                            target="_blank" 
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="w-3 h-3 mr-1" />
                            Get Project ID
                          </a>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </AlertDescription>
    </Alert>
  );
}
