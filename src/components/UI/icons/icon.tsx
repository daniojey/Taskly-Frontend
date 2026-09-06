import { ICONS } from './icons';

export type IconName = keyof typeof ICONS;

export interface IconProps extends React.SVGProps<SVGSVGElement>{
  name: string;
  size?: number;
  color?: string;
  className?: string;
  strokeWidth?: number;
}

const Icon = ({
  name,
  size = 24,
  color,
  className = '',
  strokeWidth = 2,
  style,
  ...props
}: IconProps) => {
  const icon = ICONS[name];

  if (!icon) {
    console.warn(`[Icon] Иконка "${name}" не найдена в реестре ICONS.`);
    return null;
  }

  const isStroke = icon.type === 'stroke';

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox={icon.viewBox || '0 0 24 24'}
      
      fill={isStroke ? 'none' : 'currentColor'}
      stroke={isStroke ? 'currentColor' : 'none'}
      
      strokeWidth={isStroke ? strokeWidth : undefined}
      strokeLinecap="round"
      strokeLinejoin="round"
      
      className={`inline-block shrink-0 align-middle transition-colors ${className}`}
      style={{ color, ...style }}
      role="img"
      {...props}
    >
      {icon.path}
    </svg>
  );
};

export default Icon;