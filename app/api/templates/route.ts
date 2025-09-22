import { NextResponse } from 'next/server'

// Template library stub
export async function GET() {
  return NextResponse.json({
    categories: ['school', 'nonprofit', 'medical', 'disaster_relief'],
    templates: [
      { id: 'tpl_school_basic', category: 'school', title: 'School Fundraiser - Essentials' },
      { id: 'tpl_nonprofit_impact', category: 'nonprofit', title: 'Non-profit Impact Focus' },
    ],
  })
}

