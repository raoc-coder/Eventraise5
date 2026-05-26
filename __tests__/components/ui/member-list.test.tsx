import { render, screen } from '@testing-library/react'
import MemberList from '@/components/ui/member-list'
import type { User } from '@/components/ui/member-list'

const sampleMember: User = {
  id: 'test-1',
  name: 'jane.doe',
  avatarUrl: 'https://api.dicebear.com/9.x/glass/svg?seed=jane',
  email: 'jane@example.com',
  status: 'online',
  role: 'Member',
  joinedDate: '2024-01-15',
  teamIds: ['CORE', 'DESIGN', 'PERF'],
}

describe('MemberList', () => {
  it('renders column headers', () => {
    render(<MemberList members={[sampleMember]} />)
    expect(screen.getByText('Name')).toBeInTheDocument()
    expect(screen.getByText('Status')).toBeInTheDocument()
    expect(screen.getByText('Joined')).toBeInTheDocument()
    expect(screen.getByText('Teams')).toBeInTheDocument()
  })

  it('renders a member row with name, email, and role', () => {
    render(<MemberList members={[sampleMember]} />)
    expect(screen.getByText('jane.doe')).toBeInTheDocument()
    expect(screen.getByText('jane@example.com')).toBeInTheDocument()
    expect(screen.getByText('Member')).toBeInTheDocument()
    expect(screen.getByText('Jan 2024')).toBeInTheDocument()
  })

  it('renders default sample users when members prop is omitted', () => {
    render(<MemberList />)
    expect(screen.getByText('leonel.ngoya')).toBeInTheDocument()
    expect(screen.getByText('sophia.reed')).toBeInTheDocument()
  })
})
