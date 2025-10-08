export default function TermsPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-semibold tracking-tight">Terms of Service</h1>
      <p className="mt-4 text-sm text-gray-600">Last updated: {new Date().toLocaleDateString()}</p>
      
      <div className="mt-8 space-y-6 text-gray-700">
        <section>
          <h2 className="text-lg font-semibold mb-3">1. Acceptance of Terms</h2>
          <p>By accessing and using EventraiseHub, you accept and agree to be bound by the terms and provision of this agreement.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3">2. Use License</h2>
          <p>Permission is granted to temporarily use EventraiseHub for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3">3. Payment Processing</h2>
          <p>EventraiseHub uses PayPal for payment processing. All transactions are subject to PayPal's terms of service. We are not responsible for PayPal's processing fees or policies.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3">4. User Content</h2>
          <p>You are responsible for all content you post, including event information, images, and descriptions. You grant us a license to use your content to provide our services.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3">5. Prohibited Uses</h2>
          <p>You may not use our service for any unlawful purpose or to solicit others to perform unlawful acts. You may not violate any international, federal, provincial, or state regulations, rules, laws, or local ordinances.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3">6. Disclaimer</h2>
          <p>The information on this website is provided on an "as is" basis. To the fullest extent permitted by law, EventraiseHub excludes all representations, warranties, conditions and terms relating to our website and the use of this website.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3">7. Limitation of Liability</h2>
          <p>In no event shall EventraiseHub, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3">8. Governing Law</h2>
          <p>These terms shall be interpreted and governed by the laws of the United States, without regard to its conflict of law provisions.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3">9. Changes</h2>
          <p>We reserve the right, at our sole discretion, to modify or replace these terms at any time. If a revision is material, we will try to provide at least 30 days notice prior to any new terms taking effect.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3">10. Contact Information</h2>
          <p>If you have any questions about these Terms of Service, please contact us at support@eventraisehub.com.</p>
        </section>
      </div>
    </main>
  )
}
