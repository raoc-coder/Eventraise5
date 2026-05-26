import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { JollyMenu, MenuItem } from '@/components/ui/menu-1'

describe('JollyMenu', () => {
  it('opens menu and shows items on trigger click', async () => {
    const user = userEvent.setup()
    render(
      <JollyMenu variant="outline" label="Edit">
        <MenuItem>Cut</MenuItem>
        <MenuItem>Copy</MenuItem>
      </JollyMenu>,
    )

    await user.click(screen.getByRole('button', { name: /edit/i }))
    expect(screen.getByRole('menuitem', { name: /cut/i })).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: /copy/i })).toBeInTheDocument()
  })
})
