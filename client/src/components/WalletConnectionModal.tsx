import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Wallet, Shield, Link2, Zap } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface WalletConnectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConnect: (wallet: string, address: string) => void;
}

const wallets = [
  {
    id: "metamask",
    name: "MetaMask",
    icon: Wallet,
    description: "Connect using MetaMask browser extension",
  },
  {
    id: "trustwallet",
    name: "Trust Wallet",
    icon: Shield,
    description: "Connect using Trust Wallet mobile app",
  },
  {
    id: "walletconnect",
    name: "WalletConnect",
    icon: Link2,
    description: "Scan with WalletConnect compatible wallet",
  },
  {
    id: "binance",
    name: "Binance Wallet",
    icon: Zap,
    description: "Connect using Binance Chain Wallet",
  },
];

export function WalletConnectionModal({ open, onOpenChange, onConnect }: WalletConnectionModalProps) {
  const [connecting, setConnecting] = useState<string | null>(null);
  const { toast } = useToast();

  const handleConnect = async (walletId: string, walletName: string) => {
    setConnecting(walletId);
    
    // Simulate connection delay
    setTimeout(() => {
      const mockAddress = `0x${Math.random().toString(16).substr(2, 40)}`;
      onConnect(walletName, mockAddress);
      setConnecting(null);
      onOpenChange(false);
      
      toast({
        title: "Wallet Connected! (Demo)",
        description: `Connected to ${walletName}. This is a simulated connection.`,
      });
    }, 1500);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5" />
            Connect Wallet
          </DialogTitle>
          <DialogDescription>
            Choose your preferred wallet to connect to BNBall
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 mt-4">
          {wallets.map((wallet) => {
            const IconComponent = wallet.icon;
            return (
              <Button
                key={wallet.id}
                variant="outline"
                className="w-full h-auto p-4 justify-start hover-elevate"
                onClick={() => handleConnect(wallet.id, wallet.name)}
                disabled={connecting !== null}
                data-testid={`button-connect-${wallet.id}`}
              >
                <div className="flex items-center gap-3 w-full">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <IconComponent className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-semibold">{wallet.name}</div>
                    <div className="text-xs text-muted-foreground">{wallet.description}</div>
                  </div>
                  {connecting === wallet.id && (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent"></div>
                  )}
                </div>
              </Button>
            );
          })}
        </div>

        <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <p className="text-xs text-muted-foreground">
            <strong className="text-foreground">Demo Mode:</strong> This is a simulated wallet connection. 
            In production, this would use WalletConnect protocol to securely connect your Web3 wallet.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
