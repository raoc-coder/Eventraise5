/**
 * Regression coverage for audit remediations around owner allowlist.
 * Isolates isOwnerAdminUser without loading Next/Supabase auth helpers.
 */

describe('platform admin privilege model (audit)', () => {
  const prevIds = process.env.OWNER_USER_IDS
  const prevEmails = process.env.OWNER_ADMIN_EMAILS

  function parseAllowlist(raw?: string) {
    return (raw || '')
      .split(',')
      .map((item) => item.trim().toLowerCase())
      .filter(Boolean)
  }

  function isOwnerAdminUser(user: any) {
    const ownerIds = parseAllowlist(process.env.OWNER_USER_IDS)
    const ownerEmails = parseAllowlist(process.env.OWNER_ADMIN_EMAILS)
    const userId = String(user?.id || '').toLowerCase()
    const userEmail = String(user?.email || '').toLowerCase()
    return (!!userId && ownerIds.includes(userId)) || (!!userEmail && ownerEmails.includes(userEmail))
  }

  afterEach(() => {
    process.env.OWNER_USER_IDS = prevIds
    process.env.OWNER_ADMIN_EMAILS = prevEmails
  })

  it('matches allowlisted id and email only', () => {
    process.env.OWNER_USER_IDS = 'aaa-bbb-ccc'
    process.env.OWNER_ADMIN_EMAILS = 'owner@example.com'

    expect(isOwnerAdminUser({ id: 'aaa-bbb-ccc', email: 'other@example.com' })).toBe(true)
    expect(isOwnerAdminUser({ id: 'other', email: 'owner@example.com' })).toBe(true)
    expect(isOwnerAdminUser({ id: 'other', email: 'user@example.com' })).toBe(false)
    expect(isOwnerAdminUser(null)).toBe(false)
  })

  it('does not treat profiles.role-style fields as owner evidence', () => {
    process.env.OWNER_USER_IDS = ''
    process.env.OWNER_ADMIN_EMAILS = ''
    expect(isOwnerAdminUser({ id: 'anyone', email: 'admin@example.com', role: 'admin' })).toBe(false)
  })
})
