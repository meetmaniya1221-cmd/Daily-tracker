import type { SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement> & { size?: number }

function Icon({ size = 20, children, ...rest }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {children}
    </svg>
  )
}

export const IconDashboard = (p: IconProps) => (
  <Icon {...p}>
    <rect x="3" y="3" width="7" height="9" rx="1.5" />
    <rect x="14" y="3" width="7" height="5" rx="1.5" />
    <rect x="14" y="12" width="7" height="9" rx="1.5" />
    <rect x="3" y="16" width="7" height="5" rx="1.5" />
  </Icon>
)

export const IconPencil = (p: IconProps) => (
  <Icon {...p}>
    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
  </Icon>
)

export const IconHistory = (p: IconProps) => (
  <Icon {...p}>
    <path d="M3 3v5h5" />
    <path d="M3.05 13A9 9 0 1 0 6 5.3L3 8" />
    <path d="M12 7v5l4 2" />
  </Icon>
)

export const IconTrendingUp = (p: IconProps) => (
  <Icon {...p}>
    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
    <polyline points="16 7 22 7 22 13" />
  </Icon>
)

export const IconRupee = (p: IconProps) => (
  <Icon {...p}>
    <path d="M6 3h12" />
    <path d="M6 8h12" />
    <path d="m6 13 8.5 8" />
    <path d="M6 13h3" />
    <path d="M9 13c6.667 0 6.667-10 0-10" />
  </Icon>
)

export const IconTasks = (p: IconProps) => (
  <Icon {...p}>
    <polyline points="9 11 12 14 22 4" />
    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
  </Icon>
)

export const IconCalendar = (p: IconProps) => (
  <Icon {...p}>
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </Icon>
)

export const IconTag = (p: IconProps) => (
  <Icon {...p}>
    <path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z" />
    <circle cx="7.5" cy="7.5" r="0.5" fill="currentColor" />
  </Icon>
)

export const IconSettings = (p: IconProps) => (
  <Icon {...p}>
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
    <circle cx="12" cy="12" r="3" />
  </Icon>
)

export const IconBarChart = (p: IconProps) => (
  <Icon {...p}>
    <line x1="12" y1="20" x2="12" y2="10" />
    <line x1="18" y1="20" x2="18" y2="4" />
    <line x1="6" y1="20" x2="6" y2="16" />
  </Icon>
)

export const IconFlame = (p: IconProps) => (
  <Icon {...p}>
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
  </Icon>
)

export const IconSun = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2" />
    <path d="M12 20v2" />
    <path d="m4.93 4.93 1.41 1.41" />
    <path d="m17.66 17.66 1.41 1.41" />
    <path d="M2 12h2" />
    <path d="M20 12h2" />
    <path d="m6.34 17.66-1.41 1.41" />
    <path d="m19.07 4.93-1.41 1.41" />
  </Icon>
)

export const IconMoon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
  </Icon>
)

export const IconPlus = (p: IconProps) => (
  <Icon {...p}>
    <path d="M5 12h14" />
    <path d="M12 5v14" />
  </Icon>
)

export const IconX = (p: IconProps) => (
  <Icon {...p}>
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </Icon>
)

export const IconChevronLeft = (p: IconProps) => (
  <Icon {...p}>
    <path d="m15 18-6-6 6-6" />
  </Icon>
)

export const IconChevronRight = (p: IconProps) => (
  <Icon {...p}>
    <path d="m9 18 6-6-6-6" />
  </Icon>
)

export const IconArrowUp = (p: IconProps) => (
  <Icon {...p}>
    <path d="m5 12 7-7 7 7" />
    <path d="M12 19V5" />
  </Icon>
)

export const IconArrowDown = (p: IconProps) => (
  <Icon {...p}>
    <path d="M12 5v14" />
    <path d="m19 12-7 7-7-7" />
  </Icon>
)

export const IconDownload = (p: IconProps) => (
  <Icon {...p}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </Icon>
)

export const IconUpload = (p: IconProps) => (
  <Icon {...p}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </Icon>
)

export const IconTrash = (p: IconProps) => (
  <Icon {...p}>
    <path d="M3 6h18" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
    <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </Icon>
)

export const IconAlertTriangle = (p: IconProps) => (
  <Icon {...p}>
    <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </Icon>
)

export const IconArchive = (p: IconProps) => (
  <Icon {...p}>
    <rect x="2" y="3" width="20" height="5" rx="1" />
    <path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8" />
    <line x1="10" y1="12" x2="14" y2="12" />
  </Icon>
)

export const IconRestore = (p: IconProps) => (
  <Icon {...p}>
    <polyline points="1 4 1 10 7 10" />
    <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
  </Icon>
)

export const IconMore = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="1" fill="currentColor" />
    <circle cx="19" cy="12" r="1" fill="currentColor" />
    <circle cx="5" cy="12" r="1" fill="currentColor" />
  </Icon>
)

export const IconRepeat = (p: IconProps) => (
  <Icon {...p}>
    <path d="m17 2 4 4-4 4" />
    <path d="M3 11v-1a4 4 0 0 1 4-4h14" />
    <path d="m7 22-4-4 4-4" />
    <path d="M21 13v1a4 4 0 0 1-4 4H3" />
  </Icon>
)

export const IconCheck = (p: IconProps) => (
  <Icon {...p}>
    <polyline points="20 6 9 17 4 12" />
  </Icon>
)

export const IconEdit = (p: IconProps) => (
  <Icon {...p}>
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
  </Icon>
)
