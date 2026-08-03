import type { ReactNode } from 'react';

type HeroBackgroundSectionProps = {
  backgroundImage?: string;
  overlayClassName?: string;
  className?: string;
  children: ReactNode;
};

export default function HeroBackgroundSection({
  backgroundImage = '/brand/Jamii-aide-background-image.png',
  overlayClassName = 'bg-black/45',
  className = '',
  children,
}: HeroBackgroundSectionProps) {
  return (
    <section className={`relative min-h-[70vh] sm:min-h-screen overflow-hidden text-white flex items-center ${className}`.trim()}>
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url('${backgroundImage}')` }}
        aria-hidden="true"
      />
      <div className={`absolute inset-0 ${overlayClassName}`} aria-hidden="true" />
      {children}
    </section>
  );
}
