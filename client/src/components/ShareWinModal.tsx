import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { WinImageGenerator, type WinData } from './WinImageGenerator';
import { Download, Share2, Loader2 } from 'lucide-react';
import { SiX } from 'react-icons/si';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface ShareWinModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  betId: string;
  userAddress: string;
}

export function ShareWinModal({ open, onOpenChange, betId, userAddress }: ShareWinModalProps) {
  const [winData, setWinData] = useState<WinData | null>(null);
  const [imageDataURL, setImageDataURL] = useState<string>('');
  const [tweetText, setTweetText] = useState('');
  const [isSharing, setIsSharing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  useEffect(() => {
    if (open && betId) {
      fetchWinData();
    }
  }, [open, betId]);
  
  const fetchWinData = async () => {
    setIsLoading(true);
    try {
      const res = await apiRequest('GET', `/api/social/win-data/${betId}?userAddress=${userAddress}`);
      const response = await res.json();
      
      if (response.success) {
        setWinData(response.data);
        setTweetText(`Just won ${response.data.multiplier.toFixed(2)}x on ${response.data.marketTitle}\n\nBet: ${response.data.prediction}\nStake: ${(parseFloat(response.data.stakeAmount) / 1e18).toFixed(4)} BNB\n\n#BNBall #DeFi #Crypto`);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load win data",
        variant: "destructive"
      });
      onOpenChange(false);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDownload = () => {
    if (!imageDataURL) return;
    
    const link = document.createElement('a');
    link.download = `bnball-win-${betId}.png`;
    link.href = imageDataURL;
    link.click();
    
    toast({
      title: "Image Downloaded",
      description: "Your win image has been saved!",
    });
  };
  
  const handleShareToX = async () => {
    setIsSharing(true);
    try {
      // Convert data URL to base64 (remove data:image/png;base64, prefix)
      const base64Data = imageDataURL.split(',')[1];
      
      const res = await apiRequest('POST', '/api/social/share-to-x', {
        imageBuffer: base64Data,
        text: tweetText,
        marketTitle: winData?.marketTitle,
        winAmount: winData?.winAmount,
        userAddress
      });
      const response = await res.json();
      
      if (response.success) {
        toast({
          title: "Shared to X!",
          description: "Your win has been posted to X/Twitter",
        });
        window.open(response.tweetUrl, '_blank');
        onOpenChange(false);
      }
    } catch (error: any) {
      toast({
        title: "Sharing Failed",
        description: error.message || "Unable to post to X. Please download and share manually.",
        variant: "destructive"
      });
    } finally {
      setIsSharing(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-primary" />
            Share Your Win
          </DialogTitle>
          <DialogDescription>
            Download or share your winning bet to X/Twitter
          </DialogDescription>
        </DialogHeader>
        
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : winData ? (
          <div className="space-y-6">
            {/* Hidden canvas for image generation */}
            <WinImageGenerator 
              data={winData}
              format="1:1"
              onImageGenerated={setImageDataURL}
            />
            
            {/* Preview */}
            {imageDataURL && (
              <div className="space-y-3">
                <Label>Preview</Label>
                <div className="rounded-lg overflow-hidden border border-border">
                  <img 
                    src={imageDataURL} 
                    alt="Win share preview" 
                    className="w-full"
                    data-testid="img-win-preview"
                  />
                </div>
              </div>
            )}
            
            {/* Tweet text */}
            <div className="space-y-3">
              <Label htmlFor="tweet-text">Tweet Text</Label>
              <Textarea
                id="tweet-text"
                value={tweetText}
                onChange={(e) => setTweetText(e.target.value)}
                rows={4}
                maxLength={280}
                placeholder="Customize your tweet..."
                data-testid="textarea-tweet"
              />
              <p className="text-xs text-muted-foreground text-right">
                {tweetText.length} / 280 characters
              </p>
            </div>
            
            {/* Action buttons */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleDownload}
                className="flex-1"
                disabled={!imageDataURL}
                data-testid="button-download-image"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Image
              </Button>
              <Button
                onClick={handleShareToX}
                className="flex-1 bg-black hover:bg-black/90 text-white"
                disabled={!imageDataURL || isSharing}
                data-testid="button-share-to-x"
              >
                {isSharing ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <SiX className="w-4 h-4 mr-2" />
                )}
                Share to X
              </Button>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
