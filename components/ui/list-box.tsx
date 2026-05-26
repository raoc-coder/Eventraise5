'use client'

import {
  Collection,
  Header,
  ListBoxSection as AriaListBoxSection,
  type ListBoxSectionProps,
} from 'react-aria-components'
import { cn } from '@/lib/utils'

const ListBoxCollection = Collection

function ListBoxSection<T extends object>({
  className,
  ...props
}: ListBoxSectionProps<T>) {
  return (
    <AriaListBoxSection
      className={cn('overflow-visible', className)}
      {...props}
    />
  )
}

export { ListBoxCollection, ListBoxSection, Header }
