import { Card } from "@/components/ui/card";
import { TrendingUp, Users, Zap, DollarSign } from "lucide-react";

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  change?: string;
}

function StatCard({ icon, label, value, change }: StatCardProps) {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 rounded-lg bg-primary/10">
          {icon}
        </div>
        {change && (
          <span className="text-xs font-semibold text-green-500">
            {change}
          </span>
        )}
      </div>
      <div className="text-sm text-muted-foreground mb-1">{label}</div>
      <div className="text-3xl font-bold font-mono" data-testid={`stat-${label.toLowerCase().replace(/\s+/g, '-')}`}>
        {value}
      </div>
    </Card>
  );
}

export function StatsOverview() {
  return (
    <div className="py-16 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Platform Statistics
          </h2>
          <p className="text-muted-foreground text-lg">
            Real-time data from the blockchain
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            icon={<DollarSign className="w-6 h-6 text-primary" />}
            label="Total Value Locked"
            value="$2.4M"
            change="+12.5%"
          />
          <StatCard
            icon={<Users className="w-6 h-6 text-primary" />}
            label="Active Users"
            value="12,453"
            change="+8.2%"
          />
          <StatCard
            icon={<Zap className="w-6 h-6 text-primary" />}
            label="Markets Created"
            value="1,247"
            change="+23.1%"
          />
          <StatCard
            icon={<TrendingUp className="w-6 h-6 text-primary" />}
            label="Total Volume"
            value="$18.7M"
            change="+15.4%"
          />
        </div>
      </div>
    </div>
  );
}
