import { MouseEvent } from 'react';
import { optimizedImage } from '../../lib/image';
interface AvatarProps {
  name: string;
  src?: string | null;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  onClick?: (e: MouseEvent) => void;
  className?: string;
}

const sizeMap: Record<string, string> = {
  xs: 'w-7 h-7 text-xs',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-24 h-24 text-4xl',
};

const widthMap: Record<string, number> = {
  xs: 96,
  sm: 96,
  md: 128,
  lg: 128,
  xl: 256,
};

/**
 * Reusable avatar that renders an `<img>` when `src` is provided,
 * and falls back to a coloured initial circle otherwise.
 * Renders as a `<button>` when `onClick` is provided, else a `<div>`.
 */
export function Avatar({ name, src, size = 'md', onClick, className = '' }: AvatarProps) {
  const sizeClass = sizeMap[size] ?? sizeMap.md;
  const base = `rounded-full flex-shrink-0 flex items-center justify-center overflow-hidden font-medium transition-opacity ${sizeClass} ${className}`;
  const colorClass = src ? 'bg-muted' : 'bg-primary';
  const hoverClass = onClick ? 'hover:opacity-80 cursor-pointer' : '';

  const inner = src ? (
    <img
      src={optimizedImage(src, widthMap[size] ?? 128)}
      alt={name}
      loading="lazy"
      decoding="async"
      className="w-full h-full object-cover"
    />
  ) : (
    <span className="text-primary-foreground select-none">{name.charAt(0).toUpperCase()}</span>
  );

  if (onClick) {
    return (
      <button
        onClick={onClick}
        className={`${base} ${colorClass} ${hoverClass}`}
        aria-label={`View ${name}'s profile`}
        type="button"
      >
        {inner}
      </button>
    );
  }

  return (
    <div className={`${base} ${colorClass}`}>
      {inner}
    </div>
  );
}
