export function Skeleton({ className = "" }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-gradient-to-r from-white/[0.06] via-white/[0.12] to-white/[0.06] ${className}`}
    />
  );
}
