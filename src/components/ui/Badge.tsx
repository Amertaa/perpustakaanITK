import { cn } from '@/lib/utils';

type BadgeColor = 'blue' | 'green' | 'yellow' | 'red' | 'gray' | 'orange' | 'purple';

interface BadgeProps {
  children: React.ReactNode;
  color?: BadgeColor;
  size?: 'sm' | 'md';
  dot?: boolean;
  className?: string;
}

const colors: Record<BadgeColor, string> = {
  blue:   'bg-blue-100 text-blue-700 border border-blue-200',
  green:  'bg-green-100 text-green-700 border border-green-200',
  yellow: 'bg-yellow-100 text-yellow-700 border border-yellow-200',
  red:    'bg-red-100 text-red-700 border border-red-200',
  gray:   'bg-gray-100 text-gray-600 border border-gray-200',
  orange: 'bg-orange-100 text-orange-700 border border-orange-200',
  purple: 'bg-purple-100 text-purple-700 border border-purple-200',
};

const dotColors: Record<BadgeColor, string> = {
  blue: 'bg-blue-500', green: 'bg-green-500', yellow: 'bg-yellow-500',
  red: 'bg-red-500', gray: 'bg-gray-400', orange: 'bg-orange-500', purple: 'bg-purple-500',
};

export default function Badge({ children, color = 'gray', size = 'md', dot, className }: BadgeProps) {
  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 font-medium rounded-full',
      size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs',
      colors[color],
      className
    )}>
      {dot && <span className={cn('w-1.5 h-1.5 rounded-full', dotColors[color])} />}
      {children}
    </span>
  );
}
