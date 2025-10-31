import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Copy, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function EscrowVault() {
  const { toast } = useToast();
  
  const vaultAddress = "0x742d35Cc6634C0532925a3b844Bc9e7595f0bB8f";
  
  const copyAddress = () => {
    navigator.clipboard.writeText(vaultAddress);
    toast({
      title: "Copied!",
      description: "Vault address copied to clipboard",
    });
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
      <div className="flex items-start gap-4 mb-6">
        <div className="p-3 rounded-lg bg-primary/10">
          <Shield className="w-6 h-6 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-semibold mb-2">Escrow Vault</h3>
          <p className="text-sm text-muted-foreground">
            All funds are securely held in this verified smart contract
          </p>
        </div>
      </div>
      
      <div className="space-y-4">
        <div>
          <div className="text-xs text-muted-foreground mb-1">BNB Balance</div>
          <div className="text-3xl font-bold font-mono text-primary" data-testid="text-bnb-balance">
            247.892 BNB
          </div>
          <div className="text-sm text-muted-foreground">≈ $142,847.23</div>
        </div>
        
        <div>
          <div className="text-xs text-muted-foreground mb-1">BNBALL Balance</div>
          <div className="text-2xl font-bold font-mono text-secondary" data-testid="text-bnball-balance">
            1,247,893 BNBALL
          </div>
          <div className="text-sm text-muted-foreground">≈ $18,927.45</div>
        </div>
        
        <div className="pt-4 border-t">
          <div className="text-xs text-muted-foreground mb-2">Vault Address</div>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-xs bg-background/50 px-3 py-2 rounded border font-mono" data-testid="text-vault-address">
              {vaultAddress.slice(0, 10)}...{vaultAddress.slice(-8)}
            </code>
            <Button 
              size="icon" 
              variant="outline"
              onClick={copyAddress}
              data-testid="button-copy-address"
            >
              <Copy className="w-4 h-4" />
            </Button>
            <Button 
              size="icon" 
              variant="outline"
              onClick={() => window.open(`https://bscscan.com/address/${vaultAddress}`, '_blank')}
              data-testid="button-view-on-explorer"
            >
              <ExternalLink className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
