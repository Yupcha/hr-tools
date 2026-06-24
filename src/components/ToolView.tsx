import type { Tool } from "../data/catalog";
import { calculatorRegistry, templateRegistry } from "../data/catalog";
import type { Region } from "../lib/regions";
import CalculatorTool from "./CalculatorTool";
import TemplateTool from "./TemplateTool";
import JdResumeMatcher from "./custom/JdResumeMatcher";
import GpaCalculator from "./custom/GpaCalculator";
import WeightedGrade from "./custom/WeightedGrade";
import PasswordGenerator from "./custom/PasswordGenerator";
import LessonPlanner from "./custom/LessonPlanner";
import SeatingPlan from "./custom/SeatingPlan";

const CUSTOM: Record<string, React.FC> = {
  "jd-resume-matcher": JdResumeMatcher,
  "gpa-calculator": GpaCalculator,
  "weighted-grade": WeightedGrade,
  "password-generator": PasswordGenerator,
  "lesson-planner": LessonPlanner,
  "seating-plan": SeatingPlan,
};

export default function ToolView({ tool, region }: { tool: Tool; region: Region }) {
  if (tool.kind === "template") {
    const meta = templateRegistry[tool.id];
    return meta ? <TemplateTool meta={meta} /> : <Missing id={tool.id} />;
  }
  if (tool.kind === "calculator") {
    const spec = calculatorRegistry[tool.id];
    return spec ? <CalculatorTool spec={spec} activeRegion={region} /> : <Missing id={tool.id} />;
  }
  const Cmp = CUSTOM[tool.id];
  return Cmp ? <Cmp /> : <Missing id={tool.id} />;
}

const Missing = ({ id }: { id: string }) => (
  <div className="rounded-yc border border-dashed border-hairline p-8 text-center text-muted">
    Tool “{id}” is not wired up yet.
  </div>
);
