type BrandBackgroundProps = {
  className?: string;
};

export default function BrandBackground({ className = '' }: BrandBackgroundProps) {
  return (
    <div className={`pointer-events-none absolute inset-0 ${className}`.trim()} aria-hidden="true">
      <div className="brand-shell-bg" />
      <div className="brand-shell-overlay" />
    </div>
  );
}
