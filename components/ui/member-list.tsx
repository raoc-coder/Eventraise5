'use client'

import React from 'react'
import { format } from 'date-fns'
import { Contact2 } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  statusUserColors,
  teams,
  users,
  type User,
} from '@/components/ui/member-list-data'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

export type { User } from '@/components/ui/member-list-data'
export {
  users,
  teams,
  projects,
  priorities,
  status,
  health,
  statusUserColors,
} from '@/components/ui/member-list-data'

interface TeamsTooltipProps {
  teamIds: string[]
}

function TeamsTooltip({ teamIds }: TeamsTooltipProps) {
  return (
    <Tooltip delayDuration={0}>
      <TooltipTrigger className="flex items-center gap-0.5 truncate">
        <Contact2 className="mr-1 size-4 shrink-0 text-muted-foreground" />
        {teamIds.slice(0, 2).map((teamId, index) => (
          <span key={teamId} className="mt-0.5">
            {teamId}
            {index < Math.min(teamIds.length, 2) - 1 && ', '}
          </span>
        ))}
        {teamIds.length > 2 && (
          <span className="mt-0.5">+ {teamIds.length - 2}</span>
        )}
      </TooltipTrigger>
      <TooltipContent className="p-2">
        <div className="flex flex-col gap-1">
          {teams
            .filter((team) => teamIds.includes(team.id))
            .map((team) => (
              <div key={team.id} className="flex items-center gap-2 text-xs">
                <div className="inline-flex size-6 shrink-0 items-center justify-center rounded bg-muted/50">
                  <div className="text-sm">{team.icon}</div>
                </div>
                <span className="font-medium">{team.name}</span>
              </div>
            ))}
        </div>
      </TooltipContent>
    </Tooltip>
  )
}

interface MemberLineProps {
  user: User
}

function MemberLine({ user }: MemberLineProps) {
  return (
    <div className="flex w-full items-center border-b border-muted-foreground/5 px-6 py-3 text-sm last:border-b-0 hover:bg-sidebar/50">
      <div className="flex flex-grow items-center gap-2 overflow-hidden">
        <div className="relative">
          <Avatar className="size-8">
            <AvatarImage src={user.avatarUrl} alt={user.name} />
            <AvatarFallback>{user.name[0]}</AvatarFallback>
          </Avatar>
          <span
            className="absolute -bottom-0.5 -end-0.5 size-2.5 rounded-full border-2 border-background"
            style={{ backgroundColor: statusUserColors[user.status] }}
          >
            <span className="sr-only">{user.status}</span>
          </span>
        </div>
        <div className="flex flex-col items-start overflow-hidden">
          <span className="w-full truncate font-medium">{user.name}</span>
          <span className="w-full truncate text-xs text-muted-foreground">
            {user.email}
          </span>
        </div>
      </div>
      <div className="w-32 shrink-0 text-xs text-muted-foreground">
        {user.role}
      </div>
      <div className="w-32 shrink-0 text-xs text-muted-foreground">
        {format(new Date(user.joinedDate), 'MMM yyyy')}
      </div>
      <div className="flex w-40 shrink-0 text-xs text-muted-foreground">
        <TeamsTooltip teamIds={user.teamIds} />
      </div>
    </div>
  )
}

export interface MemberListProps extends React.HTMLAttributes<HTMLDivElement> {
  members?: User[]
}

const MemberList = React.forwardRef<HTMLDivElement, MemberListProps>(
  ({ className, members = users, ...props }, ref) => (
    <TooltipProvider delayDuration={0}>
      <div
        ref={ref}
        className={cn(
          'h-full w-full bg-white text-black transition-colors duration-300 dark:bg-black dark:text-white',
          className,
        )}
        {...props}
      >
        <div className="sticky top-0 z-10 flex items-center border-b bg-muted/30 px-6 py-1.5 text-sm text-muted-foreground">
          <div className="flex-grow">Name</div>
          <div className="w-32 shrink-0">Status</div>
          <div className="w-32 shrink-0">Joined</div>
          <div className="w-40 shrink-0">Teams</div>
        </div>
        <div className="w-full">
          {members.map((user) => (
            <MemberLine key={user.id} user={user} />
          ))}
        </div>
      </div>
    </TooltipProvider>
  ),
)
MemberList.displayName = 'MemberList'

export { MemberList }
export default MemberList
