// Test script to verify PayPal INR payment setup
const { createClient } = require('@supabase/supabase-js')

// Test PayPal INR order creation
async function testPayPalINR() {
  console.log('🧪 Testing PayPal INR Payment Setup...\n')
  
  // Test 1: Check environment variables
  console.log('1. Environment Variables:')
  console.log(`   PAYPAL_CLIENT_ID: ${process.env.PAYPAL_CLIENT_ID ? '✅ Set' : '❌ Missing'}`)
  console.log(`   PAYPAL_CLIENT_SECRET: ${process.env.PAYPAL_CLIENT_SECRET ? '✅ Set' : '❌ Missing'}`)
  console.log(`   PAYPAL_ENVIRONMENT: ${process.env.PAYPAL_ENVIRONMENT || 'Not set'}`)
  console.log(`   NEXT_PUBLIC_PAYPAL_CLIENT_ID: ${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ? '✅ Set' : '❌ Missing'}\n`)
  
  // Test 2: Try creating a test INR order
  console.log('2. Testing INR Order Creation:')
  try {
    const response = await fetch('http://localhost:3000/api/paypal/create-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        eventId: 'test-event',
        amount: 2000, // ₹2000 in cents
        currency: 'INR',
        type: 'donation'
      })
    })
    
    const result = await response.json()
    
    if (response.ok) {
      console.log('   ✅ INR order creation successful')
      console.log(`   Order ID: ${result.orderId}`)
    } else {
      console.log('   ❌ INR order creation failed')
      console.log(`   Error: ${result.error}`)
    }
  } catch (error) {
    console.log('   ❌ Network error:', error.message)
  }
  
  console.log('\n3. Recommendations:')
  console.log('   - Check PayPal Developer Console for INR support')
  console.log('   - Verify PayPal account can receive INR')
  console.log('   - Test with PayPal Sandbox first')
  console.log('   - Consider Razorpay for India-specific payments')
}

// Run the test
testPayPalINR().catch(console.error)
