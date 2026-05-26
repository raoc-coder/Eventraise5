import type React from 'react'
import {
  BacklogIcon,
  CompletedIcon,
  HighPriorityIcon,
  InProgressIcon,
  LowPriorityIcon,
  MediumPriorityIcon,
  NoPriorityIcon,
  PausedIcon,
  TechnicalReviewIcon,
  ToDoIcon,
  UrgentPriorityIcon,
} from '@/components/ui/member-list-icons'

export interface User {
  id: string
  name: string
  avatarUrl: string
  email: string
  status: 'online' | 'offline' | 'away'
  role: 'Member' | 'Admin' | 'Guest'
  joinedDate: string
  teamIds: string[]
}

const avatarUrl = (seed: string) =>
  `https://api.dicebear.com/9.x/glass/svg?seed=${seed}`

export const statusUserColors = {
  online: '#00cc66',
  offline: '#969696',
  away: '#ffcc00',
} as const

export const users: User[] = [
  { id: 'ln', name: 'leonel.ngoya', avatarUrl: avatarUrl('ln'), email: 'leonelngoya@gmail.com', status: 'online', role: 'Admin', joinedDate: '2022-01-01', teamIds: ['CORE', 'PERF', 'DESIGN', 'WEB'] },
  { id: 'sophia', name: 'sophia.reed', avatarUrl: avatarUrl('sophiareed'), email: 'sophiareed@gmail.com', status: 'offline', role: 'Admin', joinedDate: '2023-06-04', teamIds: ['CORE', 'PERF'] },
  { id: 'mason', name: 'mason.carter', avatarUrl: avatarUrl('mason'), email: 'masoncarter@gmail.com', status: 'away', role: 'Member', joinedDate: '2023-11-01', teamIds: ['CORE', 'DESIGN'] },
  { id: 'emma', name: 'emma.jones', avatarUrl: avatarUrl('emmajones'), email: 'emmajones@gmail.com', status: 'online', role: 'Member', joinedDate: '2023-03-20', teamIds: ['CORE'] },
  { id: 'alex', name: 'alex.zhang', avatarUrl: avatarUrl('alexzhang'), email: 'alexzhang@gmail.com', status: 'online', role: 'Member', joinedDate: '2023-05-15', teamIds: ['DESIGN', 'PERF'] },
  { id: 'olivia', name: 'olivia.wilson', avatarUrl: avatarUrl('oliviawilson'), email: 'oliviawilson@gmail.com', status: 'offline', role: 'Admin', joinedDate: '2022-08-22', teamIds: ['PERF'] },
  { id: 'lucas', name: 'lucas.martin', avatarUrl: avatarUrl('lucasmartin'), email: 'lucasmartin@gmail.com', status: 'away', role: 'Member', joinedDate: '2023-02-14', teamIds: ['CORE', 'DESIGN', 'PERF'] },
  { id: 'isabella', name: 'isabella.garcia', avatarUrl: avatarUrl('isabellagarcia'), email: 'isabellagarcia@gmail.com', status: 'online', role: 'Member', joinedDate: '2022-11-30', teamIds: ['DESIGN'] },
  { id: 'ethan', name: 'ethan.brown', avatarUrl: avatarUrl('ethanbrown'), email: 'ethanbrown@gmail.com', status: 'offline', role: 'Member', joinedDate: '2023-07-18', teamIds: ['PERF'] },
  { id: 'amelia', name: 'amelia.kim', avatarUrl: avatarUrl('ameliakim'), email: 'ameliakim@gmail.com', status: 'online', role: 'Guest', joinedDate: '2022-05-09', teamIds: ['DESIGN'] },
  { id: 'noah', name: 'noah.davis', avatarUrl: avatarUrl('noahdavis'), email: 'noahdavis@gmail.com', status: 'away', role: 'Member', joinedDate: '2023-09-27', teamIds: ['PERF', 'DESIGN'] },
  { id: 'charlotte', name: 'charlotte.miller', avatarUrl: avatarUrl('charlottemiller'), email: 'charlottemiller@gmail.com', status: 'online', role: 'Guest', joinedDate: '2022-04-03', teamIds: ['PERF'] },
  { id: 'aiden', name: 'aiden.thompson', avatarUrl: avatarUrl('aidenthompson'), email: 'aidenthompson@gmail.com', status: 'offline', role: 'Admin', joinedDate: '2023-01-12', teamIds: ['DESIGN'] },
  { id: 'mia', name: 'mia.patel', avatarUrl: avatarUrl('miapatel'), email: 'miapatel@gmail.com', status: 'online', role: 'Member', joinedDate: '2022-10-05', teamIds: ['DESIGN', 'PERF'] },
  { id: 'logan', name: 'logan.wright', avatarUrl: avatarUrl('loganwright'), email: 'loganwright@gmail.com', status: 'away', role: 'Guest', joinedDate: '2023-08-14', teamIds: ['PERF', 'DESIGN'] },
  { id: 'harper', name: 'harper.robinson', avatarUrl: avatarUrl('harperrobinson'), email: 'harperrobinson@gmail.com', status: 'offline', role: 'Member', joinedDate: '2022-07-29', teamIds: ['PERF'] },
  { id: 'gabriel', name: 'gabriel.nguyen', avatarUrl: avatarUrl('gabrielnguyen'), email: 'gabrielnguyen@gmail.com', status: 'online', role: 'Member', joinedDate: '2023-04-17', teamIds: ['DESIGN'] },
  { id: 'victoria', name: 'victoria.lee', avatarUrl: avatarUrl('victorialee'), email: 'victorialee@gmail.com', status: 'away', role: 'Guest', joinedDate: '2022-12-08', teamIds: ['DESIGN'] },
  { id: 'daniel', name: 'daniel.taylor', avatarUrl: avatarUrl('danieltaylor'), email: 'danieltaylor@gmail.com', status: 'offline', role: 'Member', joinedDate: '2023-10-21', teamIds: ['PERF'] },
  { id: 'abigail', name: 'abigail.moore', avatarUrl: avatarUrl('abigailmoore'), email: 'abigailmoore@gmail.com', status: 'online', role: 'Member', joinedDate: '2022-06-17', teamIds: ['DESIGN', 'PERF'] },
]

export interface Priority {
  id: string
  name: string
  icon: React.FC<React.SVGProps<SVGSVGElement>>
}

export const priorities: Priority[] = [
  { id: 'no-priority', name: 'No priority', icon: NoPriorityIcon },
  { id: 'urgent', name: 'Urgent', icon: UrgentPriorityIcon },
  { id: 'high', name: 'High', icon: HighPriorityIcon },
  { id: 'medium', name: 'Medium', icon: MediumPriorityIcon },
  { id: 'low', name: 'Low', icon: LowPriorityIcon },
]

export interface Status {
  id: string
  name: string
  color: string
  icon: React.FC
}

export const status: Status[] = [
  { id: 'in-progress', name: 'In Progress', color: '#facc15', icon: InProgressIcon },
  { id: 'technical-review', name: 'Technical Review', color: '#22c55e', icon: TechnicalReviewIcon },
  { id: 'completed', name: 'Completed', color: '#8b5cf6', icon: CompletedIcon },
  { id: 'paused', name: 'Paused', color: '#0ea5e9', icon: PausedIcon },
  { id: 'to-do', name: 'Todo', color: '#f97316', icon: ToDoIcon },
  { id: 'backlog', name: 'Backlog', color: '#ec4899', icon: BacklogIcon },
]

interface Health {
  id: 'no-update' | 'off-track' | 'on-track' | 'at-risk'
  name: string
  color: string
  description: string
}

export const health: Health[] = [
  { id: 'no-update', name: 'No Update', color: '#FF0000', description: 'The project has not been updated in the last 30 days.' },
  { id: 'off-track', name: 'Off Track', color: '#FF0000', description: 'The project is not on track and may be delayed.' },
  { id: 'on-track', name: 'On Track', color: '#00FF00', description: 'The project is on track and on schedule.' },
  { id: 'at-risk', name: 'At Risk', color: '#FF0000', description: 'The project is at risk and may be delayed.' },
]

export interface Project {
  id: string
  name: string
  status: Status
  icon: string
  percentComplete: number
  startDate: string
  lead: User
  priority: Priority
  health: Health
}

export const projects: Project[] = [
  { id: '1', name: 'LNDev UI - Core Components', status: status[0], icon: 'Cuboid', percentComplete: 80, startDate: '2025-03-08', lead: users[2], priority: priorities[1], health: health[0] },
  { id: '2', name: 'LNDev UI - Theming', status: status[1], icon: 'Blocks', percentComplete: 50, startDate: '2025-03-14', lead: users[0], priority: priorities[0], health: health[3] },
  { id: '3', name: 'LNDev UI - Modals', status: status[2], icon: 'Vault', percentComplete: 0, startDate: '2025-03-09', lead: users[1], priority: priorities[2], health: health[1] },
  { id: '4', name: 'LNDev UI - Navigation', status: status[3], icon: 'BrickWall', percentComplete: 0, startDate: '2025-03-10', lead: users[2], priority: priorities[0], health: health[2] },
  { id: '5', name: 'LNDev UI - Layout', status: status[4], icon: 'Wallpaper', percentComplete: 0, startDate: '2025-03-11', lead: users[0], priority: priorities[0], health: health[3] },
  { id: '6', name: 'LNDev UI - Sidebar', status: status[5], icon: 'TrafficCone', percentComplete: 0, startDate: '2025-03-12', lead: users[1], priority: priorities[0], health: health[1] },
  { id: '7', name: 'LNDev UI - Cards', status: status[1], icon: 'Grid2X2', percentComplete: 0, startDate: '2025-03-13', lead: users[2], priority: priorities[0], health: health[2] },
  { id: '8', name: 'LNDev UI - Tooltip', status: status[2], icon: 'Bomb', percentComplete: 0, startDate: '2025-03-14', lead: users[0], priority: priorities[0], health: health[3] },
  { id: '9', name: 'LNDev UI - Dropdown', status: status[3], icon: 'Shapes', percentComplete: 50, startDate: '2025-03-15', lead: users[1], priority: priorities[0], health: health[3] },
  { id: '10', name: 'LNDev UI - Data Tables', status: status[0], icon: 'Table', percentComplete: 65, startDate: '2025-03-18', lead: users[2], priority: priorities[1], health: health[0] },
]

export interface Team {
  id: string
  name: string
  icon: string
  joined: boolean
  color: string
  members: User[]
  projects: Project[]
}

export const teams: Team[] = [
  { id: 'CORE', name: 'LNDev Core', icon: '🛠️', joined: true, color: '#FF0000', members: [users[8], users[10], users[2], users[3], users[4]], projects: [projects[5], projects[8], projects[3]] },
  { id: 'DESIGN', name: 'Design System', icon: '🎨', joined: true, color: '#00FF00', members: [users[7], users[3]], projects: [projects[1], projects[1], projects[2], projects[3]] },
  { id: 'PERF', name: 'Performance Lab', icon: '☀️', joined: false, color: '#0000FF', members: [users[5], users[0], users[1], users[2], users[3], users[4], users[6]], projects: [projects[8], projects[8]] },
]
