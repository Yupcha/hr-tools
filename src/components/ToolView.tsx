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
import Profiles from "./custom/Profiles";
import AiSettings from "./custom/AiSettings";

/** One-shot seed passed in when a tool is opened "about a person". */
export type Prefill = Record<string, string> | null;

/**
 * Custom tools may optionally accept the person-as-hero plumbing. The widened
 * type means a custom view can launch other tools with a seed (e.g. Profiles'
 * PersonCard) without each component being forced to declare the props.
 */
export interface CustomProps {
  onSelect?: (id: string, seed?: Record<string, string>) => void;
}

const CUSTOM: Record<string, React.FC<CustomProps>> = {
  "jd-resume-matcher": JdResumeMatcher,
  "gpa-calculator": GpaCalculator,
  "weighted-grade": WeightedGrade,
  "password-generator": PasswordGenerator,
  "lesson-planner": LessonPlanner,
  "seating-plan": SeatingPlan,
  "profiles": Profiles,
  "ai-settings": AiSettings,
};

export default function ToolView({
  tool, region, prefill, onPrefillConsumed, onSelect,
}: {
  tool: Tool;
  region: Region;
  prefill?: Prefill;
  onPrefillConsumed?: () => void;
  onSelect?: (id: string, seed?: Record<string, string>) => void;
}) {
  if (tool.kind === "template") {
    const meta = templateRegistry[tool.id];
    return meta
      ? <TemplateTool toolId={tool.id} meta={meta} prefill={prefill ?? null} onPrefillConsumed={onPrefillConsumed} />
      : <Missing id={tool.id} />;
  }
  if (tool.kind === "calculator") {
    const spec = calculatorRegistry[tool.id];
    return spec
      ? <CalculatorTool spec={spec} activeRegion={region} prefill={prefill ?? null} onPrefillConsumed={onPrefillConsumed} />
      : <Missing id={tool.id} />;
  }
  const Cmp = CUSTOM[tool.id];
  return Cmp ? <Cmp onSelect={onSelect} /> : <Missing id={tool.id} />;
}

const Missing = ({ id }: { id: string }) => (
  <div className="rounded-yc border border-dashed border-hairline p-8 text-center text-muted">
    Tool “{id}” is not wired up yet.
  </div>
);
