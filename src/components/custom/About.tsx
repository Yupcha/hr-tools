import { ALL_TOOLS } from "../../data/catalog";
import { STAGES } from "../../data/lifecycle";
import { getIcon } from "../../lib/icons";
import { cn } from "../../lib/useLocalStorage";
import { openExternal, YUPCHA_URL, REPO_URL } from "../../lib/links";

const VERSION = "0.1.0";

export default function About() {
  const Globe = getIcon("Globe");
  const Heart = getIcon("Heart");
  const Shield = getIcon("ShieldCheck");
  const Sparkles = getIcon("Sparkles");
  const FileText = getIcon("FileText");
  const Arrow = getIcon("CornerDownLeft"); // reused as a small mark; links carry ↗ text

  const stat = (n: number, label: string) => (
    <span className="rounded-full bg-soft px-3 py-1 text-[12px] text-muted">
      <strong className="text-ink">{n}</strong> {label}
    </span>
  );

  const Link = ({ url, title, sub, icon }: { url: string; title: string; sub: string; icon: React.ReactNode }) => (
    <button
      onClick={() => openExternal(url)}
      className="group flex items-center gap-3 rounded-yc border border-hairline bg-surface px-4 py-3 text-left transition hover:border-coral/30"
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-soft text-faint transition group-hover:text-coral">
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[13.5px] font-semibold text-ink">{title}&nbsp;↗</span>
        <span className="block truncate text-[12px] text-muted">{sub}</span>
      </span>
    </button>
  );

  return (
    <div className="max-w-2xl space-y-6">
      {/* Brand */}
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-yc bg-coral text-[22px] font-bold text-white shadow-sm">h</div>
        <div>
          <div className="text-[18px] font-bold tracking-tight text-ink">hr-tools</div>
          <div className="text-[12.5px] text-muted">
            by <button onClick={() => openExternal(YUPCHA_URL)} className="font-semibold text-coral hover:underline">Yupcha</button>
            <span className="px-1.5 opacity-40">·</span>v{VERSION}
            <span className="px-1.5 opacity-40">·</span>MIT licensed
          </div>
        </div>
      </div>

      <p className="text-[14.5px] leading-relaxed text-body">
        A free, open-source desktop toolkit for busy recruiters, HR teams and teachers —
        letters, HR emails, payslips, region-aware payroll calculators and classroom tools,
        all in one tiny, fast app. <strong className="text-ink">Offline by default</strong>:
        no accounts, no cloud, nothing leaves your machine.
      </p>

      <div className="flex flex-wrap gap-2">
        {stat(ALL_TOOLS.length, "tools")}
        {stat(STAGES.length, "lifecycle moments")}
        {stat(8, "regions")}
      </div>

      {/* What's inside */}
      <div className="space-y-2.5 rounded-yc border border-hairline bg-surface p-5">
        <div className="text-[11px] font-semibold uppercase tracking-widest text-faint">What's inside</div>
        {[
          { Icon: FileText, title: "Letters, HR emails & payslips", sub: "Formal/modern/friendly tones, live preview, copy & clean PDF export." },
          { Icon: Globe, title: "Region-aware payroll & tax", sub: "Take-home, gratuity, HRA, end-of-service & PAYE across 8 regions — labelled estimates." },
          { Icon: Sparkles, title: "People-first & optional AI", sub: "Save a company & people once and auto-fill anything; opt-in AI drafting (local or your key)." },
          { Icon: Shield, title: "Private by design", sub: "Strict offline security policy; your data stays in this device's storage." },
        ].map(({ Icon, title, sub }) => (
          <div key={title} className="flex items-start gap-3 py-0.5">
            <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-soft text-faint">
              <Icon size={14} />
            </span>
            <div>
              <div className="text-[13.5px] font-semibold text-ink">{title}</div>
              <div className="text-[12.5px] leading-snug text-muted">{sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Documents stay clean */}
      <div className={cn("flex items-start gap-2 rounded-yc border border-hairline bg-soft/40 px-4 py-3 text-[12.5px] leading-relaxed text-muted")}>
        <FileText size={15} className="mt-0.5 shrink-0 text-teal" />
        <span>
          <strong className="text-ink">Your documents stay yours.</strong> Generated letters,
          emails and payslips carry <strong>no hr-tools branding</strong> — they come out as clean,
          professional company documents (add your own letterhead from a saved Company profile).
        </span>
      </div>

      {/* Links */}
      <div className="grid gap-2.5 sm:grid-cols-3">
        <Link url={YUPCHA_URL} title="Visit Yupcha" sub="yupcha.com — more tools" icon={<Globe size={16} />} />
        <Link url={REPO_URL} title="View source" sub="GitHub · Yupcha/hr-tools" icon={<Heart size={16} />} />
        <Link url={`${REPO_URL}/issues`} title="Report an issue" sub="Bugs & requests" icon={<Sparkles size={16} />} />
      </div>

      <p className="text-[11.5px] leading-relaxed text-faint">
        <Arrow size={11} className="mb-0.5 mr-1 inline" />
        hr-tools is free and open-source under the MIT license. Statutory calculators are
        estimates — always verify with an official source before relying on a figure.
      </p>

      <div className="border-t border-hairline pt-3 text-center text-[11px] text-muted">
        Powered by{" "}
        <button onClick={() => openExternal(YUPCHA_URL)} className="font-semibold text-coral hover:underline">
          Yupcha.com
        </button>
      </div>
    </div>
  );
}
