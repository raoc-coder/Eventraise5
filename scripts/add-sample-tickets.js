const { createClient } = require('@supabase/supabase-js')

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function addSampleTickets() {
  try {
    console.log('Fetching events...')
    
    // Get all published events
    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select('id, title, start_date')
      .eq('is_published', true)
      .order('created_at', { ascending: false })

    if (eventsError) {
      console.error('Error fetching events:', eventsError)
      return
    }

    console.log(`Found ${events.length} published events`)

    for (const event of events) {
      console.log(`\nProcessing event: ${event.title} (${event.id})`)
      
      // Check if event already has tickets
      const { data: existingTickets, error: ticketsError } = await supabase
        .from('event_tickets')
        .select('id')
        .eq('event_id', event.id)
        .limit(1)

      if (ticketsError) {
        console.error(`Error checking tickets for ${event.title}:`, ticketsError)
        continue
      }

      if (existingTickets && existingTickets.length > 0) {
        console.log(`  ✓ Event already has tickets, skipping`)
        continue
      }

      // Add sample tickets
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
        },
        {
          event_id: event.id,
          name: 'Student Discount',
          price_cents: 1500, // $15.00
          currency: 'usd',
          quantity_total: 50,
          sales_start_at: new Date().toISOString(),
          sales_end_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        }
      ]

      const { data: insertedTickets, error: insertError } = await supabase
        .from('event_tickets')
        .insert(sampleTickets)
        .select('id, name, price_cents')

      if (insertError) {
        console.error(`  ✗ Error adding tickets to ${event.title}:`, insertError)
        continue
      }

      console.log(`  ✓ Added ${insertedTickets.length} sample tickets:`)
      insertedTickets.forEach(ticket => {
        console.log(`    - ${ticket.name}: $${(ticket.price_cents / 100).toFixed(2)}`)
      })
    }

    console.log('\n✅ Sample tickets added successfully!')
    console.log('\nYou can now test ticket purchases on your events.')
    
  } catch (error) {
    console.error('Unexpected error:', error)
  }
}

// Run the script
addSampleTickets()
