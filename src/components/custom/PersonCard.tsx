import { getIcon } from "../../lib/icons";
import { TOOL_BY_ID } from "../../data/catalog";
import { personActions, type Profile } from "../../lib/profiles";

/**
 * The person-as-hero card. Given a saved Person, surface the documents and
 * numbers *about them* — each opens the target tool pre-filled via a one-shot
 * seed (App.select(id, seed)). The seed only ever carries this person's data,
 * so nothing in the opened tool gets clobbered beyond the fields it fills.
 */
export default function PersonCard({
  person, onLaunch, onEdit,
}: {
  person: Profile;
  onLaunch: (toolId: string, seed: Record<string, string>) => void;
  onEdit?: (p: Profile) => void;
}) {
  const Users = getIcon("Users");
  const Pencil = getIcon("Pencil");
  const ChevronRight = getIcon("ChevronRight");

  const actions = personActions(person, (id) => id in TOOL_BY_ID);
  const subtitle = [person.fields["Job Title"], person.fields["Department"]]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="rounded-yc border border-hairline bg-surface p-5 shadow-sm">
      {/* Identity */}
      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-yc bg-coral-soft text-coral">
          <Users size={20} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="truncate text-[16px] font-bold text-ink">{person.label || "Untitled"}</div>
          {subtitle && <div className="truncate text-[12.5px] text-muted">{subtitle}</div>}
          {person.fields["Annual CTC"] && (
            <div className="mt-0.5 font-mono text-[12px] tabular-nums text-faint">
              CTC {person.fields["Annual CTC"]}
            </div>
          )}
        </div>
        {onEdit && (
          <button
            onClick={() => onEdit(person)}
            title="Edit details"
            aria-label="Edit details"
            className="shrink-0 text-faint transition hover:text-ink"
          >
            <Pencil size={15} />
          </button>
        )}
      </div>

      {/* Actions about this person */}
      <div className="mt-4">
        <div className="mb-2 text-[10.5px] font-bold uppercase tracking-[0.12em] text-faint">
          Create about {person.label?.split(" ")[0] || "them"}
        </div>
        {actions.length === 0 ? (
          <p className="rounded-lg bg-soft/50 px-3 py-2 text-[12px] leading-relaxed text-muted">
            Add a job title, CTC or joining date to this person to unlock one-tap
            letters and payslips.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
            {actions.map(({ action, seed }) => {
              const tool = TOOL_BY_ID[action.toolId];
              const Icon = getIcon(tool?.icon ?? "FileText");
              return (
                <button
                  key={action.toolId}
                  onClick={() => onLaunch(action.toolId, seed)}
                  className="group flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-[13px] text-body transition hover:bg-soft/70 hover:text-ink"
                >
                  <Icon size={15} className="shrink-0 text-faint group-hover:text-coral" />
                  <span className="min-w-0 flex-1 truncate">{action.label}</span>
                  <ChevronRight size={14} className="shrink-0 text-transparent transition group-hover:text-faint group-hover:translate-x-0.5" />
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
