import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { TrendingUp, AlertCircle, ExternalLink } from "lucide-react";
import { useCreateMarket } from "@/hooks/usePredictionMarket";
import { useWeb3 } from "@/hooks/useWeb3";
import { getExplorerUrl } from "@/lib/contractConfig";
import { useChainId } from "wagmi";
import { useEffect } from "react";

const createMarketSchema = z.object({
  title: z.string().min(10, "Title must be at least 10 characters"),
  description: z.string().min(50, "Description must be at least 50 characters"),
  category: z.string().min(1, "Please select a category"),
  deadline: z.string().min(1, "Please set a deadline").refine((val) => {
    const date = new Date(val);
    return date > new Date();
  }, "Deadline must be in the future"),
  resolutionMethod: z.string().min(1, "Please select a resolution method"),
});

type CreateMarketForm = z.infer<typeof createMarketSchema>;

export default function CreateMarket() {
  const { toast } = useToast();
  const chainId = useChainId();
  const { isConnected, connect } = useWeb3();
  const { createMarket, isLoading, isSuccess, txHash } = useCreateMarket();
  
  const form = useForm<CreateMarketForm>({
    resolver: zodResolver(createMarketSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      deadline: "",
      resolutionMethod: "hybrid",
    },
  });

  useEffect(() => {
    if (isSuccess && txHash) {
      toast({
        title: "Market Created Successfully!",
        description: (
          <div className="flex flex-col gap-2">
            <p>Your prediction market is now live on-chain.</p>
            <a
              href={getExplorerUrl(chainId, txHash)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary hover:underline flex items-center gap-1"
            >
              View on BSCScan <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        ),
      });
      form.reset();
    }
  }, [isSuccess, txHash, chainId, toast, form]);

  const onSubmit = async (data: CreateMarketForm) => {
    if (!isConnected) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to create a market.",
        variant: "destructive",
      });
      connect();
      return;
    }

    const deadline = new Date(data.deadline);
    await createMarket(data.title, data.description, data.category, deadline);
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
              <TrendingUp className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">
              Create Prediction Market
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Launch your own prediction market and earn fees from trading activity
            </p>
          </div>

          <Card className="p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Market Question</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Will Lakers beat Warriors by 10+ points on Nov 15?"
                          {...field}
                          data-testid="input-market-title"
                        />
                      </FormControl>
                      <FormDescription>
                        Ask a clear yes/no question about a future event
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Provide detailed context about the event, including specific conditions for YES/NO outcomes..."
                          className="min-h-32"
                          {...field}
                          data-testid="input-market-description"
                        />
                      </FormControl>
                      <FormDescription>
                        Explain the market conditions and resolution criteria
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-category">
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="nba">NBA</SelectItem>
                            <SelectItem value="nfl">NFL</SelectItem>
                            <SelectItem value="fifa">FIFA</SelectItem>
                            <SelectItem value="esports">E-Sports</SelectItem>
                            <SelectItem value="boxing">Boxing</SelectItem>
                            <SelectItem value="mma">MMA</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="deadline"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Deadline</FormLabel>
                        <FormControl>
                          <Input
                            type="datetime-local"
                            {...field}
                            data-testid="input-deadline"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="resolutionMethod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Resolution Method</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-resolution">
                            <SelectValue placeholder="How will the outcome be determined?" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="chainlink">Chainlink Sports Oracle</SelectItem>
                          <SelectItem value="ai">AI Verification</SelectItem>
                          <SelectItem value="hybrid">Chainlink + AI (Recommended)</SelectItem>
                          <SelectItem value="community">Community Vote</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Choose how the market result will be verified
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />


                <div className="flex items-start gap-3 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-muted-foreground">
                    <p className="font-semibold text-foreground mb-1">Market Creator Requirements & Benefits:</p>
                    <ul className="space-y-1 text-xs">
                      <li>• Requires 1.0 BNB stake (refunded when market resolves)</li>
                      <li>• Earn 0.5% fee on all trading volume</li>
                      <li>• Build reputation as a trusted market creator</li>
                      <li>• Minimum betting amount for participants: 0.01 BNB</li>
                    </ul>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    type="submit"
                    className="flex-1"
                    size="lg"
                    disabled={isLoading || !isConnected}
                    data-testid="button-create-market"
                  >
                    {isLoading ? "Creating Market..." : isConnected ? "Create Market" : "Connect Wallet"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    onClick={() => form.reset()}
                    disabled={isLoading}
                    data-testid="button-reset"
                  >
                    Reset
                  </Button>
                </div>
              </form>
            </Form>
          </Card>

          <Card className="mt-8 p-6 bg-muted/30">
            <h3 className="font-semibold mb-3">Before Creating Your Market</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <span className="text-primary">✓</span>
                <span>Ensure the event has a clear, verifiable outcome</span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary">✓</span>
                <span>Set a reasonable deadline that gives traders time to participate</span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary">✓</span>
                <span>Choose the appropriate oracle method for your event type</span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary">✓</span>
                <span>Review our market creation guidelines to avoid disputes</span>
              </li>
            </ul>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
}
