'use client'

import React from 'react'

interface IconProps extends React.SVGProps<SVGSVGElement> {
  className?: string
}

export const NoPriorityIcon = ({ className, ...props }: IconProps) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="currentColor"
    className={className}
    aria-label="No Priority"
    role="img"
    focusable="false"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <rect x="1.5" y="7.25" width="3" height="1.5" rx="0.5" opacity="0.9" />
    <rect x="6.5" y="7.25" width="3" height="1.5" rx="0.5" opacity="0.9" />
    <rect x="11.5" y="7.25" width="3" height="1.5" rx="0.5" opacity="0.9" />
  </svg>
)

export const UrgentPriorityIcon = ({ className, ...props }: IconProps) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="currentColor"
    className={className}
    aria-label="Urgent Priority"
    role="img"
    focusable="false"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path d="M3 1C1.91067 1 1 1.91067 1 3V13C1 14.0893 1.91067 15 3 15H13C14.0893 15 15 14.0893 15 13V3C15 1.91067 14.0893 1 13 1H3ZM7 4L9 4L8.75391 8.99836H7.25L7 4ZM9 11C9 11.5523 8.55228 12 8 12C7.44772 12 7 11.5523 7 11C7 10.4477 7.44772 10 8 10C8.55228 10 9 10.4477 9 11Z" />
  </svg>
)

export const HighPriorityIcon = ({ className, ...props }: IconProps) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="currentColor"
    className={className}
    aria-label="High Priority"
    role="img"
    focusable="false"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <rect x="1.5" y="8" width="3" height="6" rx="1" />
    <rect x="6.5" y="5" width="3" height="9" rx="1" />
    <rect x="11.5" y="2" width="3" height="12" rx="1" />
  </svg>
)

export const MediumPriorityIcon = ({ className, ...props }: IconProps) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="currentColor"
    className={className}
    aria-label="Medium Priority"
    role="img"
    focusable="false"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <rect x="1.5" y="8" width="3" height="6" rx="1" />
    <rect x="6.5" y="5" width="3" height="9" rx="1" />
    <rect x="11.5" y="2" width="3" height="12" rx="1" fillOpacity="0.4" />
  </svg>
)

export const LowPriorityIcon = ({ className, ...props }: IconProps) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="currentColor"
    className={className}
    aria-label="Low Priority"
    role="img"
    focusable="false"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <rect x="1.5" y="8" width="3" height="6" rx="1" />
    <rect x="6.5" y="5" width="3" height="9" rx="1" fillOpacity="0.4" />
    <rect x="11.5" y="2" width="3" height="12" rx="1" fillOpacity="0.4" />
  </svg>
)

export const BacklogIcon: React.FC = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
    <circle
      cx="7"
      cy="7"
      r="6"
      fill="none"
      stroke="#bec2c8"
      strokeWidth="2"
      strokeDasharray="1.4 1.74"
      strokeDashoffset="0.65"
    />
    <circle
      cx="7"
      cy="7"
      r="2"
      fill="none"
      stroke="#bec2c8"
      strokeWidth="4"
      strokeDasharray="0 100"
      strokeDashoffset="0"
      transform="rotate(-90 7 7)"
    />
  </svg>
)

export const PausedIcon: React.FC = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
    <circle
      cx="7"
      cy="7"
      r="6"
      fill="none"
      stroke="#0ea5e9"
      strokeWidth="2"
      strokeDasharray="3.14 0"
      strokeDashoffset="-0.7"
    />
    <circle
      cx="7"
      cy="7"
      r="2"
      fill="none"
      stroke="#0ea5e9"
      strokeWidth="4"
      strokeDasharray="6.2517693806436885 100"
      strokeDashoffset="0"
      transform="rotate(-90 7 7)"
    />
  </svg>
)

export const ToDoIcon: React.FC = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
    <circle
      cx="7"
      cy="7"
      r="6"
      fill="none"
      stroke="#e2e2e2"
      strokeWidth="2"
      strokeDasharray="3.14 0"
      strokeDashoffset="-0.7"
    />
    <circle
      cx="7"
      cy="7"
      r="2"
      fill="none"
      stroke="#e2e2e2"
      strokeWidth="4"
      strokeDasharray="0 100"
      strokeDashoffset="0"
      transform="rotate(-90 7 7)"
    />
  </svg>
)

export const InProgressIcon: React.FC = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
    <circle
      cx="7"
      cy="7"
      r="6"
      fill="none"
      stroke="#facc15"
      strokeWidth="2"
      strokeDasharray="3.14 0"
      strokeDashoffset="-0.7"
    />
    <circle
      cx="7"
      cy="7"
      r="2"
      fill="none"
      stroke="#facc15"
      strokeWidth="4"
      strokeDasharray="2.0839231268812295 100"
      strokeDashoffset="0"
      transform="rotate(-90 7 7)"
    />
  </svg>
)

export const TechnicalReviewIcon: React.FC = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
    <circle
      cx="7"
      cy="7"
      r="6"
      fill="none"
      stroke="#22c55e"
      strokeWidth="2"
      strokeDasharray="3.14 0"
      strokeDashoffset="-0.7"
    />
    <circle
      cx="7"
      cy="7"
      r="2"
      fill="none"
      stroke="#22c55e"
      strokeWidth="4"
      strokeDasharray="4.167846253762459 100"
      strokeDashoffset="0"
      transform="rotate(-90 7 7)"
    />
  </svg>
)

export const CompletedIcon: React.FC = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
    <circle
      cx="7"
      cy="7"
      r="6"
      fill="none"
      stroke="#8b5cf6"
      strokeWidth="2"
      strokeDasharray="3.14 0"
      strokeDashoffset="-0.7"
    />
    <path
      d="M4.5 7L6.5 9L9.5 5"
      stroke="#8b5cf6"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)
