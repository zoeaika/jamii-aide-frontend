import Image from 'next/image';

type BrandLogoProps = {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
};

const sizeMap = {
  sm: { mark: 28, text: 'text-lg' },
  md: { mark: 36, text: 'text-2xl' },
  lg: { mark: 64, text: 'text-3xl' },
} as const;

export default function BrandLogo({
  size = 'md',
  showText = true,
  className = '',
}: BrandLogoProps) {
  const config = sizeMap[size];

  return (
    <span className={`inline-flex items-center gap-2 ${className}`.trim()}>
      <Image
        src="/brand/jamii-aide-logomark.svg"
        alt="Jamii Aide"
        width={config.mark}
        height={config.mark}
        className="shrink-0"
        priority
      />
      {showText ? (
        <span className={`font-bold text-brand-deep-navy ${config.text}`.trim()}>Jamii Aide</span>
      ) : null}
    </span>
  );
}
