import { Trophy, TrendingUp, Sparkles, ChevronRight } from "lucide-react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export function LeaderboardPreview() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <div ref={ref} className="py-24 bg-background relative overflow-hidden">
      {/* Background Glow Effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            Top Predictors
          </h2>
          <p className="text-muted-foreground text-lg">
            Join the elite predictors earning real BNB with winning strategies
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          {/* Coming Soon Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card 
              className="p-12 relative overflow-hidden bg-gradient-to-br from-primary/10 via-secondary/5 to-transparent border-primary/30"
              data-testid="leaderboard-coming-soon"
            >
              {/* Animated Background Elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-pulse" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-secondary/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
              
              <div className="relative z-10 text-center">
                {/* Trophy Icon */}
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={isInView ? { scale: 1, opacity: 1 } : { scale: 0.8, opacity: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="mb-6 flex justify-center"
                >
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-yellow-500 to-yellow-600 flex items-center justify-center shadow-[0_0_30px_rgba(255,215,0,0.3)]">
                    <Trophy className="w-12 h-12 text-white" />
                  </div>
                </motion.div>

                {/* Coming Soon Badge */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                  className="mb-4 flex justify-center"
                >
                  <Badge className="bg-gradient-to-r from-primary to-secondary text-black font-bold px-4 py-1 text-sm uppercase tracking-wide">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Coming Soon
                  </Badge>
                </motion.div>

                {/* Title */}
                <motion.h3
                  initial={{ opacity: 0, y: 10 }}
                  animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                  className="text-3xl font-bold mb-4"
                  data-testid="text-coming-soon-title"
                >
                  Leaderboard Under Construction
                </motion.h3>

                {/* Description */}
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                  transition={{ duration: 0.5, delay: 0.7 }}
                  className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto"
                  data-testid="text-coming-soon-description"
                >
                  We're building an advanced leaderboard to track top predictors, win rates, and total earnings. 
                  Start placing bets now to climb the ranks when it launches!
                </motion.p>

                {/* Feature List */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                  transition={{ duration: 0.5, delay: 0.8 }}
                  className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
                >
                  <div className="flex items-center justify-center gap-2 text-sm">
                    <Trophy className="w-5 h-5 text-primary" />
                    <span className="text-muted-foreground">Global Rankings</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 text-sm">
                    <TrendingUp className="w-5 h-5 text-secondary" />
                    <span className="text-muted-foreground">Win Rate Stats</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 text-sm">
                    <Sparkles className="w-5 h-5 text-accent" />
                    <span className="text-muted-foreground">Total Earnings</span>
                  </div>
                </motion.div>

                {/* CTA Button */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                  transition={{ duration: 0.5, delay: 0.9 }}
                >
                  <Link href="/markets">
                    <Button
                      size="lg"
                      className="px-10 h-12 bg-primary hover:bg-primary/90 font-bold shadow-[0_0_20px_rgba(255,215,0,0.3)] hover:shadow-[0_0_30px_rgba(255,215,0,0.5)]"
                      data-testid="button-view-markets"
                    >
                      View Live Markets
                      <ChevronRight className="w-5 h-5 ml-2" />
                    </Button>
                  </Link>
                </motion.div>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
