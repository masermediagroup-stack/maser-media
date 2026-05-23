import Image from 'next/image';
import type { SVGProps } from 'react';

type ProcessSvgIconProps = SVGProps<SVGSVGElement>;

export type ProcessIconProps = {
  className?: string;
};

const PROCESS_RASTER_ICON = {
  direct: {
    src: '/assets/process-icon-direct.png',
    width: 1024,
    height: 1024,
  },
  launch: {
    src: '/assets/process-icon-launch.png',
    width: 1024,
    height: 1024,
  },
} as const;

export function ProcessIconDirect({ className }: ProcessIconProps) {
  const asset = PROCESS_RASTER_ICON.direct;
  return (
    <Image
      src={asset.src}
      alt=""
      width={asset.width}
      height={asset.height}
      className={className}
      aria-hidden
      data-process-icon="direct"
    />
  );
}

export function ProcessIconSystem({ className, ...props }: ProcessSvgIconProps) {
  const stroke = 'currentColor';

  return (
    <svg
      className={className}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      data-process-icon="system"
      {...props}
    >
      <circle cx="24" cy="24" r="7" stroke={stroke} strokeWidth="2" />
      <circle cx="24" cy="8" r="3.5" stroke={stroke} strokeWidth="2" />
      <circle cx="38" cy="32" r="3.5" stroke={stroke} strokeWidth="2" />
      <circle cx="10" cy="32" r="3.5" stroke={stroke} strokeWidth="2" />
      <path
        d="M24 15v6M31 26l5 4M17 26l-5 4"
        stroke={stroke}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function ProcessIconLaunch({ className }: ProcessIconProps) {
  const asset = PROCESS_RASTER_ICON.launch;
  return (
    <Image
      src={asset.src}
      alt=""
      width={asset.width}
      height={asset.height}
      className={className}
      aria-hidden
      data-process-icon="launch"
    />
  );
}

export function ProcessIconMark({ className, ...props }: ProcessSvgIconProps) {
  const stroke = 'currentColor';

  return (
    <svg
      className={className}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      data-process-icon="mark"
      {...props}
    >
      <path
        d="M12 36V12l12 8 12-8v24"
        stroke={stroke}
        strokeWidth="2.25"
        strokeLinejoin="round"
      />
      <path d="M24 20v16" stroke={stroke} strokeWidth="2" strokeLinecap="round" opacity="0.65" />
    </svg>
  );
}

const PROCESS_ICON_MAP = {
  direct: ProcessIconDirect,
  system: ProcessIconSystem,
  launch: ProcessIconLaunch,
} as const;

export type ProcessIconKey = keyof typeof PROCESS_ICON_MAP;

export function ProcessIconByKey({
  icon,
  className,
}: ProcessIconProps & { icon: ProcessIconKey }) {
  const Icon = PROCESS_ICON_MAP[icon];
  return <Icon className={className} />;
}
