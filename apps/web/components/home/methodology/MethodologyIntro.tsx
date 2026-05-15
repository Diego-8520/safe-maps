import { EquationImplementedCard } from "./EquationImplementedCard";
import { LocalRiskSourceCard } from "./LocalRiskSourceCard";
import { MethodologyHeader } from "./MethodologyHeader";
import { SystemFlowDiagram } from "./SystemFlowDiagram";

export function MethodologyIntro() {
  return (
    <div className="mb-14">
      {/* Top: header text + pipeline diagram */}
      <div className="mb-8 grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <MethodologyHeader />
        <SystemFlowDiagram />
      </div>

      {/* Bottom: equation card + risk source card */}
      <div className="grid gap-6 md:grid-cols-2">
        <EquationImplementedCard />
        <LocalRiskSourceCard />
      </div>
    </div>
  );
}
