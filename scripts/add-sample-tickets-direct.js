// Simple script to add sample tickets
// Run this with: node scripts/add-sample-tickets-direct.js

const { createClient } = require('@supabase/supabase-js')

// You need to replace these with your actual Supabase credentials
// Get them from your .env.local file or Supabase dashboard
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'YOUR_SUPABASE_URL'
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'YOUR_SERVICE_ROLE_KEY'

if (supabaseUrl === 'YOUR_SUPABASE_URL' || supabaseKey === 'YOUR_SERVICE_ROLE_KEY') {
  console.log('Please update the script with your Supabase credentials:')
  console.log('1. Open scripts/add-sample-tickets-direct.js')
  console.log('2. Replace YOUR_SUPABASE_URL with your actual Supabase URL')
  console.log('3. Replace YOUR_SERVICE_ROLE_KEY with your actual service role key')
  console.log('4. Run: node scripts/add-sample-tickets-direct.js')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function addSampleTickets() {
  try {
    console.log('🔍 Fetching published events...')
    
    // Get all published events
    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select('id, title, start_date')
      .eq('is_published', true)
      .order('created_at', { ascending: false })

    if (eventsError) {
      console.error('❌ Error fetching events:', eventsError)
      return
    }

    console.log(`✅ Found ${events.length} published events`)

    if (events.length === 0) {
      console.log('ℹ️  No published events found. Please publish an event first.')
      return
    }

    for (const event of events) {
      console.log(`\n📅 Processing: ${event.title}`)
      
      // Check if event already has tickets
      const { data: existingTickets, error: ticketsError } = await supabase
        .from('event_tickets')
        .select('id, name')
        .eq('event_id', event.id)
        .limit(1)

      if (ticketsError) {
        console.error(`❌ Error checking tickets:`, ticketsError)
        continue
      }

      if (existingTickets && existingTickets.length > 0) {
        console.log(`  ✅ Already has tickets: ${existingTickets[0].name}`)
        continue
      }

      // Create sample tickets
      const sampleTickets = [
        {
          event_id: event.id,
          name: 'General Admission',
          price_cents: 2500, // $25.00
          currency: 'usd',
          quantity_total: 100,
          sales_start_at: new Date().toISOString(),
          sales_end_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
        },
        {
          event_id: event.id,
          name: 'VIP Pass',
          price_cents: 5000, // $50.00
          currency: 'usd',
          quantity_total: 20,
          sales_start_at: new Date().toISOString(),
          sales_end_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        }
      ]

      console.log(`  🎫 Adding ${sampleTickets.length} sample tickets...`)

      const { data: insertedTickets, error: insertError } = await supabase
        .from('event_tickets')
        .insert(sampleTickets)
        .select('id, name, price_cents')

      if (insertError) {
        console.error(`  ❌ Error adding tickets:`, insertError)
        continue
      }

      console.log(`  ✅ Successfully added tickets:`)
      insertedTickets.forEach(ticket => {
        console.log(`    - ${ticket.name}: $${(ticket.price_cents / 100).toFixed(2)}`)
      })
    }

    console.log('\n🎉 Sample tickets added successfully!')
    console.log('\n📝 Next steps:')
    console.log('1. Go to your event page')
    console.log('2. Click "Purchase Tickets" to test the flow')
    console.log('3. Use "Manage Tickets" to create custom tickets')
    
  } catch (error) {
    console.error('💥 Unexpected error:', error)
  }
}

// Run the script
addSampleTickets()
