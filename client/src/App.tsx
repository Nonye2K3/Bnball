import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Web3Provider } from "@/contexts/Web3Provider";
import { AnimatePresence } from "framer-motion";
import Home from "@/pages/Home";
import Markets from "@/pages/Markets";
import HowItWorks from "@/pages/HowItWorks";
import Tokenomics from "@/pages/Tokenomics";
import Oracle from "@/pages/Oracle";
import FAQ from "@/pages/FAQ";
import CreateMarket from "@/pages/CreateMarket";
import Leaderboard from "@/pages/Leaderboard";
import NotFound from "@/pages/not-found";

function Router() {
  const [location] = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Switch location={location} key={location}>
        <Route path="/" component={Home} />
        <Route path="/markets" component={Markets} />
        <Route path="/how-it-works" component={HowItWorks} />
        <Route path="/tokenomics" component={Tokenomics} />
        <Route path="/oracle" component={Oracle} />
        <Route path="/faq" component={FAQ} />
        <Route path="/create" component={CreateMarket} />
        <Route path="/leaderboard" component={Leaderboard} />
        <Route component={NotFound} />
      </Switch>
    </AnimatePresence>
  );
}

function App() {
  return (
    <Web3Provider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </QueryClientProvider>
    </Web3Provider>
  );
}

export default App;
