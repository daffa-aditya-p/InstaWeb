import clsx from "clsx";

export function Input({ label, error, className, ...props }) {
  return (
    <label className="block space-y-2">
      {label ? <span className="text-sm font-medium text-white/[0.72]">{label}</span> : null}
      <input className={clsx("field-shell", className)} {...props} />
      {error ? <span className="text-xs text-brand-rose">{error}</span> : null}
    </label>
  );
}

export function Textarea({ label, error, className, rows = 4, ...props }) {
  return (
    <label className="block space-y-2">
      {label ? <span className="text-sm font-medium text-white/[0.72]">{label}</span> : null}
      <textarea className={clsx("field-shell resize-y", className)} rows={rows} {...props} />
      {error ? <span className="text-xs text-brand-rose">{error}</span> : null}
    </label>
  );
}

export function Select({ label, error, className, children, ...props }) {
  return (
    <label className="block space-y-2">
      {label ? <span className="text-sm font-medium text-white/[0.72]">{label}</span> : null}
      <select className={clsx("field-shell", className)} {...props}>
        {children}
      </select>
      {error ? <span className="text-xs text-brand-rose">{error}</span> : null}
    </label>
  );
}
