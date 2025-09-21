import { render, screen } from '@testing-library/react'
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card'

describe('Card Components', () => {
  describe('Card', () => {
    it('renders with default props', () => {
      render(<Card>Card content</Card>)
      expect(screen.getByText('Card content')).toBeInTheDocument()
    })

    it('applies correct classes', () => {
      render(<Card>Card content</Card>)
      const card = screen.getByText('Card content').parentElement
      expect(card).toHaveClass('rounded-xl', 'border-gray-200', 'bg-white', 'text-gray-900')
    })

    it('applies custom className', () => {
      render(<Card className="custom-class">Card content</Card>)
      const card = screen.getByText('Card content').parentElement
      expect(card).toHaveClass('custom-class')
    })
  })

  describe('CardHeader', () => {
    it('renders with content', () => {
      render(
        <Card>
          <CardHeader>Header content</CardHeader>
        </Card>
      )
      expect(screen.getByText('Header content')).toBeInTheDocument()
    })

    it('applies correct classes', () => {
      render(
        <Card>
          <CardHeader>Header content</CardHeader>
        </Card>
      )
      const header = screen.getByText('Header content')
      expect(header).toHaveClass('flex', 'flex-col', 'space-y-1.5', 'p-6')
    })
  })

  describe('CardTitle', () => {
    it('renders with content', () => {
      render(
        <Card>
          <CardTitle>Card Title</CardTitle>
        </Card>
      )
      expect(screen.getByText('Card Title')).toBeInTheDocument()
    })

    it('applies correct classes', () => {
      render(
        <Card>
          <CardTitle>Card Title</CardTitle>
        </Card>
      )
      const title = screen.getByText('Card Title')
      expect(title).toHaveClass('text-2xl', 'font-semibold', 'text-gray-900')
    })
  })

  describe('CardDescription', () => {
    it('renders with content', () => {
      render(
        <Card>
          <CardDescription>Card description</CardDescription>
        </Card>
      )
      expect(screen.getByText('Card description')).toBeInTheDocument()
    })

    it('applies correct classes', () => {
      render(
        <Card>
          <CardDescription>Card description</CardDescription>
        </Card>
      )
      const description = screen.getByText('Card description')
      expect(description).toHaveClass('text-sm', 'text-gray-600')
    })
  })

  describe('CardContent', () => {
    it('renders with content', () => {
      render(
        <Card>
          <CardContent>Card content</CardContent>
        </Card>
      )
      expect(screen.getByText('Card content')).toBeInTheDocument()
    })

    it('applies correct classes', () => {
      render(
        <Card>
          <CardContent>Card content</CardContent>
        </Card>
      )
      const content = screen.getByText('Card content')
      expect(content).toHaveClass('p-6', 'pt-0')
    })
  })

  describe('CardFooter', () => {
    it('renders with content', () => {
      render(
        <Card>
          <CardFooter>Footer content</CardFooter>
        </Card>
      )
      expect(screen.getByText('Footer content')).toBeInTheDocument()
    })

    it('applies correct classes', () => {
      render(
        <Card>
          <CardFooter>Footer content</CardFooter>
        </Card>
      )
      const footer = screen.getByText('Footer content')
      expect(footer).toHaveClass('flex', 'items-center', 'p-6', 'pt-0')
    })
  })

  describe('Complete Card Structure', () => {
    it('renders a complete card with all components', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Test Card</CardTitle>
            <CardDescription>This is a test card</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Card content goes here</p>
          </CardContent>
          <CardFooter>
            <button>Action</button>
          </CardFooter>
        </Card>
      )

      expect(screen.getByText('Test Card')).toBeInTheDocument()
      expect(screen.getByText('This is a test card')).toBeInTheDocument()
      expect(screen.getByText('Card content goes here')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Action' })).toBeInTheDocument()
    })
  })
})
