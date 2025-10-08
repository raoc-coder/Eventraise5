export default function PrivacyPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-semibold tracking-tight">Privacy Policy</h1>
      <p className="mt-4 text-sm text-gray-600">Last updated: {new Date().toLocaleDateString()}</p>
      
      <div className="mt-8 space-y-6 text-gray-700">
        <section>
          <h2 className="text-lg font-semibold mb-3">1. Information We Collect</h2>
          <p>We collect information you provide directly to us, such as when you create an account, create an event, make a donation, or contact us for support. This may include your name, email address, phone number, and payment information.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3">2. How We Use Your Information</h2>
          <p>We use the information we collect to provide, maintain, and improve our services, process transactions, send you technical notices and support messages, and communicate with you about products, services, and events.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3">3. Information Sharing</h2>
          <p>We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy. We may share your information with service providers who assist us in operating our website and conducting our business.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3">4. Payment Information</h2>
          <p>We use PayPal for payment processing. Your payment information is handled securely by PayPal and is subject to PayPal&apos;s privacy policy. We do not store your full payment card details on our servers.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3">5. Data Security</h2>
          <p>We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3">6. Cookies and Tracking</h2>
          <p>We use cookies and similar tracking technologies to enhance your experience on our website. You can control cookie settings through your browser preferences.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3">7. Third-Party Services</h2>
          <p>Our website may contain links to third-party websites. We are not responsible for the privacy practices of these external sites. We encourage you to review their privacy policies.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3">8. Data Retention</h2>
          <p>We retain your personal information for as long as necessary to provide our services and fulfill the purposes outlined in this privacy policy, unless a longer retention period is required by law.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3">9. Your Rights</h2>
          <p>You have the right to access, update, or delete your personal information. You may also opt out of certain communications from us. To exercise these rights, please contact us at support@eventraisehub.com.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3">10. Children&apos;s Privacy</h2>
          <p>Our services are not directed to children under 13. We do not knowingly collect personal information from children under 13. If we become aware that we have collected personal information from a child under 13, we will take steps to delete such information.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3">11. Changes to This Policy</h2>
          <p>We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the &quot;Last updated&quot; date.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3">12. Contact Us</h2>
          <p>If you have any questions about this privacy policy, please contact us at support@eventraisehub.com.</p>
        </section>
      </div>
    </main>
  )
}
