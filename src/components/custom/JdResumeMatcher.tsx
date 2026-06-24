import { useMemo, useState } from "react";
import { cn } from "../../lib/useLocalStorage";

const STOP = new Set(
  ("a an the and or but for to of in on at by with as is are was were be been being this that these those " +
   "we you they he she it our your their his her its will shall can may must should would could have has had " +
   "do does did not no yes from into over under about above below up down out off who whom which what when where " +
   "why how all any both each few more most other some such than too very just also able role work experience " +
   "team strong good plus etc per via using used use within across including include includes required require " +
   "responsibilities responsibility candidate candidates ability years year month company looking join")
    .split(" "),
);

function tokens(text: string): string[] {
  return (text.toLowerCase().match(/[a-z][a-z0-9+#.]{1,}/g) ?? [])
    .map((w) => w.replace(/\.$/, ""))
    .filter((w) => w.length > 2 && !STOP.has(w));
}

export default function JdResumeMatcher() {
  const [jd, setJd] = useState("");
  const [resume, setResume] = useState("");

  const analysis = useMemo(() => {
    const jdSet = new Set(tokens(jd));
    const resumeSet = new Set(tokens(resume));
    if (jdSet.size === 0) return null;
    const matched: string[] = [];
    const missing: string[] = [];
    jdSet.forEach((w) => (resumeSet.has(w) ? matched : missing).push(w));
    const score = Math.round((matched.length / jdSet.size) * 100);
    return {
      score,
      matched: matched.sort(),
      missing: missing.sort(),
      jdCount: jdSet.size,
    };
  }, [jd, resume]);

  const ta =
    "min-h-[180px] w-full resize-y rounded-yc border border-hairline bg-canvas px-3.5 py-3 text-[13px] leading-relaxed text-ink outline-none transition focus:border-coral focus:bg-surface focus:ring-4 focus:ring-coral/10";

  const ring = analysis
    ? analysis.score >= 70 ? "text-mint" : analysis.score >= 45 ? "text-ochre" : "text-coral"
    : "text-faint";

  return (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-[12px] font-semibold text-body">Job Description</span>
          <textarea className={ta} value={jd} placeholder="Paste the full job description…" onChange={(e) => setJd(e.target.value)} />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-[12px] font-semibold text-body">Resume / CV text</span>
          <textarea className={ta} value={resume} placeholder="Paste the candidate's resume text…" onChange={(e) => setResume(e.target.value)} />
        </label>
      </div>

      {analysis && (
        <div className="grid gap-4 md:grid-cols-[200px_1fr]">
          <div className="flex flex-col items-center justify-center rounded-yc border border-hairline bg-surface p-5 shadow-sm">
            <div className={cn("font-mono text-5xl font-bold tabular-nums", ring)}>{analysis.score}%</div>
            <div className="mt-1 text-[12px] font-medium text-muted">keyword match</div>
            <div className="mt-2 text-[11px] text-faint">
              {analysis.matched.length}/{analysis.jdCount} JD keywords found
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <KeywordBox title="Matched" tone="mint" words={analysis.matched} empty="No overlap yet." />
            <KeywordBox title="Missing from resume" tone="coral" words={analysis.missing} empty="Great — nothing missing!" />
          </div>
        </div>
      )}

      <p className="rounded-lg bg-soft/60 px-3 py-2 text-[11px] leading-relaxed text-muted">
        Fully offline. This compares meaningful keywords (skills, tools, terms) in the JD against the resume — a fast
        first-pass ATS-style screen. It does not judge experience quality or context.
      </p>
    </div>
  );
}

function KeywordBox({ title, words, tone, empty }: { title: string; words: string[]; tone: "mint" | "coral"; empty: string }) {
  return (
    <div className="rounded-yc border border-hairline bg-surface p-4 shadow-sm">
      <div className="mb-2.5 flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-widest text-faint">{title}</span>
        <span className={cn("font-mono text-[12px]", tone === "mint" ? "text-mint" : "text-coral")}>{words.length}</span>
      </div>
      {words.length === 0 ? (
        <p className="text-[12px] text-faint">{empty}</p>
      ) : (
        <div className="flex max-h-[220px] flex-wrap gap-1.5 overflow-y-auto scroll">
          {words.map((w) => (
            <span
              key={w}
              className={cn(
                "rounded-md px-2 py-0.5 text-[12px] font-medium",
                tone === "mint" ? "bg-mint/10 text-mint" : "bg-coral/10 text-coral",
              )}
            >
              {w}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
