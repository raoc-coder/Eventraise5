import { Button } from '@/components/ui/button'

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Simple, transparent fee</h1>
          <p className="text-gray-600 mb-8">Use of the platform is free. We only charge a platform fee of <span className="font-semibold text-gray-900">8.99%</span> on donations received (Braintree processing fees apply).</p>
          <a href="/auth/register">
            <Button className="btn-primary">Get started</Button>
          </a>
        </div>
      </div>
    </div>
  )
}


