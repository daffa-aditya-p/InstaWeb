import clsx from "clsx";

const variants = {
  primary:
    "bg-white text-ink-950 hover:bg-brand-aqua focus-visible:ring-brand-aqua/30",
  secondary:
    "border border-white/10 bg-white/[0.08] text-white hover:bg-white/[0.12] focus-visible:ring-white/20",
  ghost: "text-white/70 hover:bg-white/[0.08] hover:text-white focus-visible:ring-white/[0.15]",
  danger:
    "border border-brand-rose/25 bg-brand-rose/12 text-brand-rose hover:bg-brand-rose/20 focus-visible:ring-brand-rose/20",
  success:
    "border border-brand-lime/25 bg-brand-lime/12 text-brand-lime hover:bg-brand-lime/20 focus-visible:ring-brand-lime/20",
};

const sizes = {
  sm: "h-9 px-3 text-xs",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-5 text-sm",
  icon: "h-10 w-10 p-0",
};

export function Button({
  as,
  children,
  className,
  icon: Icon,
  size = "md",
  variant = "secondary",
  type = "button",
  ...props
}) {
  const Component = as || "button";
  return (
    <Component
      {...(!as ? { type } : {})}
      className={clsx(
        "inline-flex shrink-0 items-center justify-center gap-2 rounded-lg font-semibold transition duration-200 focus-visible:outline-none focus-visible:ring-4 disabled:cursor-not-allowed disabled:opacity-50",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {Icon ? <Icon className="h-4 w-4" /> : null}
      {children}
    </Component>
  );
}
