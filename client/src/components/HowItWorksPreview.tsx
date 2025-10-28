import { Calendar, Coins, Trophy } from "lucide-react";
import { motion } from "framer-motion";

export function HowItWorksPreview() {
  const steps = [
    {
      icon: Calendar,
      title: "Pick a match",
      description: "Choose from live sports events",
      color: "text-primary"
    },
    {
      icon: Coins,
      title: "Predict YES or NO",
      description: "Place your prediction on-chain",
      color: "text-primary"
    },
    {
      icon: Trophy,
      title: "Withdraw on-chain",
      description: "Claim winnings instantly",
      color: "text-primary"
    }
  ];

  return (
    <div className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">How it works</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              viewport={{ once: true }}
              className="flex flex-col items-center text-center"
            >
              {/* Icon Container */}
              <div className="relative mb-6">
                {/* Background Circle */}
                <div className="w-32 h-32 rounded-2xl bg-card border border-border/50 flex items-center justify-center">
                  <step.icon className={`w-16 h-16 ${step.color} icon-3d`} />
                </div>
                
                {/* Step Number */}
                <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                  {index + 1}
                </div>
              </div>
              
              {/* Content */}
              <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
              <p className="text-muted-foreground">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
