import { PricingOptimizer } from "@/components/pricing-optimizer";

export default function PricingPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold font-headline tracking-tight">AI Pricing Optimizer</h1>
      <p className="text-muted-foreground">Suggest optimized pricing based on historical data and current booking trends.</p>
      <div className="mt-6">
        <PricingOptimizer />
      </div>
    </div>
  );
}
