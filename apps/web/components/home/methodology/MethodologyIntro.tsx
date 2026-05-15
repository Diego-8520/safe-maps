import { EquationImplementedCard } from "./EquationImplementedCard";
import { LocalRiskSourceCard } from "./LocalRiskSourceCard";
import { MethodologyHeader } from "./MethodologyHeader";

export function MethodologyIntro() {
  return (
    <div className="mb-14 grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
      <MethodologyHeader />
      <div className="flex flex-col gap-4">
        <EquationImplementedCard />
        <LocalRiskSourceCard />
      </div>
    </div>
  );
}
