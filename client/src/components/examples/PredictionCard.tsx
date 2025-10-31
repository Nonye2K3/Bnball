import { PredictionCard } from '../PredictionCard';

export default function PredictionCardExample() {
  return (
    <div className="p-8 max-w-md">
      <PredictionCard
        id="1"
        title="Will Lakers beat Warriors by 10+ points on Nov 15?"
        category="NBA"
        status="live"
        deadline={new Date(Date.now() + 86400000 * 2)}
        yesOdds={45.5}
        noOdds={54.5}
        totalPool="12.5"
        participants={156}
        resolutionMethod="Chainlink Sports Oracle"
      />
    </div>
  );
}
