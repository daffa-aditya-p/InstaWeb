import clsx from "clsx";

const tones = {
  neutral: "border-white/10 bg-white/[0.08] text-white/70",
  green: "border-brand-lime/25 bg-brand-lime/10 text-brand-lime",
  rose: "border-brand-rose/25 bg-brand-rose/10 text-brand-rose",
  aqua: "border-brand-aqua/25 bg-brand-aqua/10 text-brand-aqua",
  amber: "border-brand-amber/25 bg-brand-amber/10 text-brand-amber",
};

export function Badge({ children, tone = "neutral", className }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
