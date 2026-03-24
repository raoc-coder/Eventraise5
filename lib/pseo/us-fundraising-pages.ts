export type StateCapitalSeed = {
  stateSlug: string
  stateName: string
  citySlug: string
  cityName: string
}

export const US_STATE_CAPITAL_SEEDS: StateCapitalSeed[] = [
  { stateSlug: 'alabama', stateName: 'Alabama', citySlug: 'montgomery', cityName: 'Montgomery' },
  { stateSlug: 'alaska', stateName: 'Alaska', citySlug: 'juneau', cityName: 'Juneau' },
  { stateSlug: 'arizona', stateName: 'Arizona', citySlug: 'phoenix', cityName: 'Phoenix' },
  { stateSlug: 'arkansas', stateName: 'Arkansas', citySlug: 'little-rock', cityName: 'Little Rock' },
  { stateSlug: 'california', stateName: 'California', citySlug: 'sacramento', cityName: 'Sacramento' },
  { stateSlug: 'colorado', stateName: 'Colorado', citySlug: 'denver', cityName: 'Denver' },
  { stateSlug: 'connecticut', stateName: 'Connecticut', citySlug: 'hartford', cityName: 'Hartford' },
  { stateSlug: 'delaware', stateName: 'Delaware', citySlug: 'dover', cityName: 'Dover' },
  { stateSlug: 'florida', stateName: 'Florida', citySlug: 'tallahassee', cityName: 'Tallahassee' },
  { stateSlug: 'georgia', stateName: 'Georgia', citySlug: 'atlanta', cityName: 'Atlanta' },
  { stateSlug: 'hawaii', stateName: 'Hawaii', citySlug: 'honolulu', cityName: 'Honolulu' },
  { stateSlug: 'idaho', stateName: 'Idaho', citySlug: 'boise', cityName: 'Boise' },
  { stateSlug: 'illinois', stateName: 'Illinois', citySlug: 'springfield', cityName: 'Springfield' },
  { stateSlug: 'indiana', stateName: 'Indiana', citySlug: 'indianapolis', cityName: 'Indianapolis' },
  { stateSlug: 'iowa', stateName: 'Iowa', citySlug: 'des-moines', cityName: 'Des Moines' },
  { stateSlug: 'kansas', stateName: 'Kansas', citySlug: 'topeka', cityName: 'Topeka' },
  { stateSlug: 'kentucky', stateName: 'Kentucky', citySlug: 'frankfort', cityName: 'Frankfort' },
  { stateSlug: 'louisiana', stateName: 'Louisiana', citySlug: 'baton-rouge', cityName: 'Baton Rouge' },
  { stateSlug: 'maine', stateName: 'Maine', citySlug: 'augusta', cityName: 'Augusta' },
  { stateSlug: 'maryland', stateName: 'Maryland', citySlug: 'annapolis', cityName: 'Annapolis' },
  { stateSlug: 'massachusetts', stateName: 'Massachusetts', citySlug: 'boston', cityName: 'Boston' },
  { stateSlug: 'michigan', stateName: 'Michigan', citySlug: 'lansing', cityName: 'Lansing' },
  { stateSlug: 'minnesota', stateName: 'Minnesota', citySlug: 'saint-paul', cityName: 'Saint Paul' },
  { stateSlug: 'mississippi', stateName: 'Mississippi', citySlug: 'jackson', cityName: 'Jackson' },
  { stateSlug: 'missouri', stateName: 'Missouri', citySlug: 'jefferson-city', cityName: 'Jefferson City' },
  { stateSlug: 'montana', stateName: 'Montana', citySlug: 'helena', cityName: 'Helena' },
  { stateSlug: 'nebraska', stateName: 'Nebraska', citySlug: 'lincoln', cityName: 'Lincoln' },
  { stateSlug: 'nevada', stateName: 'Nevada', citySlug: 'carson-city', cityName: 'Carson City' },
  { stateSlug: 'new-hampshire', stateName: 'New Hampshire', citySlug: 'concord', cityName: 'Concord' },
  { stateSlug: 'new-jersey', stateName: 'New Jersey', citySlug: 'trenton', cityName: 'Trenton' },
  { stateSlug: 'new-mexico', stateName: 'New Mexico', citySlug: 'santa-fe', cityName: 'Santa Fe' },
  { stateSlug: 'new-york', stateName: 'New York', citySlug: 'albany', cityName: 'Albany' },
  { stateSlug: 'north-carolina', stateName: 'North Carolina', citySlug: 'raleigh', cityName: 'Raleigh' },
  { stateSlug: 'north-dakota', stateName: 'North Dakota', citySlug: 'bismarck', cityName: 'Bismarck' },
  { stateSlug: 'ohio', stateName: 'Ohio', citySlug: 'columbus', cityName: 'Columbus' },
  { stateSlug: 'oklahoma', stateName: 'Oklahoma', citySlug: 'oklahoma-city', cityName: 'Oklahoma City' },
  { stateSlug: 'oregon', stateName: 'Oregon', citySlug: 'salem', cityName: 'Salem' },
  { stateSlug: 'pennsylvania', stateName: 'Pennsylvania', citySlug: 'harrisburg', cityName: 'Harrisburg' },
  { stateSlug: 'rhode-island', stateName: 'Rhode Island', citySlug: 'providence', cityName: 'Providence' },
  { stateSlug: 'south-carolina', stateName: 'South Carolina', citySlug: 'columbia', cityName: 'Columbia' },
  { stateSlug: 'south-dakota', stateName: 'South Dakota', citySlug: 'pierre', cityName: 'Pierre' },
  { stateSlug: 'tennessee', stateName: 'Tennessee', citySlug: 'nashville', cityName: 'Nashville' },
  { stateSlug: 'texas', stateName: 'Texas', citySlug: 'austin', cityName: 'Austin' },
  { stateSlug: 'utah', stateName: 'Utah', citySlug: 'salt-lake-city', cityName: 'Salt Lake City' },
  { stateSlug: 'vermont', stateName: 'Vermont', citySlug: 'montpelier', cityName: 'Montpelier' },
  { stateSlug: 'virginia', stateName: 'Virginia', citySlug: 'richmond', cityName: 'Richmond' },
  { stateSlug: 'washington', stateName: 'Washington', citySlug: 'olympia', cityName: 'Olympia' },
  { stateSlug: 'west-virginia', stateName: 'West Virginia', citySlug: 'charleston', cityName: 'Charleston' },
  { stateSlug: 'wisconsin', stateName: 'Wisconsin', citySlug: 'madison', cityName: 'Madison' },
  { stateSlug: 'wyoming', stateName: 'Wyoming', citySlug: 'cheyenne', cityName: 'Cheyenne' },
]

export const ORGANIZATION_TYPES = [
  { slug: 'schools', label: 'Schools' },
  { slug: 'nonprofits', label: 'Nonprofits' },
  { slug: 'volunteer-run-organizations', label: 'Volunteer-run Organizations' },
  { slug: 'faith-communities', label: 'Faith Communities' },
  { slug: 'community-groups', label: 'Community Groups' },
] as const

export const FUNDRAISING_TOPICS = [
  { slug: 'walkathon-fundraising', label: 'Walkathon Fundraising' },
  { slug: '5k-run-fundraising', label: '5K Run Fundraising' },
  { slug: 'silent-auction-fundraising', label: 'Silent Auction Fundraising' },
  { slug: 'online-giving-campaign', label: 'Online Giving Campaign' },
  { slug: 'peer-to-peer-fundraising', label: 'Peer-to-Peer Fundraising' },
  { slug: 'gala-fundraising-event', label: 'Gala Fundraising Event' },
  { slug: 'community-festival-fundraiser', label: 'Community Festival Fundraiser' },
  { slug: 'school-carnival-fundraiser', label: 'School Carnival Fundraiser' },
  { slug: 'teacher-appreciation-fundraiser', label: 'Teacher Appreciation Fundraiser' },
  { slug: 'field-trip-fundraiser', label: 'Field Trip Fundraiser' },
  { slug: 'choir-band-trip-fundraiser', label: 'Choir and Band Trip Fundraiser' },
  { slug: 'sports-team-fundraiser', label: 'Sports Team Fundraiser' },
  { slug: 'booster-club-fundraiser', label: 'Booster Club Fundraiser' },
  { slug: 'pta-pto-fundraiser', label: 'PTA and PTO Fundraiser' },
  { slug: 'book-fair-fundraiser', label: 'Book Fair Fundraiser' },
  { slug: 'giving-tuesday-campaign', label: 'Giving Tuesday Campaign' },
  { slug: 'holiday-fundraising-drive', label: 'Holiday Fundraising Drive' },
  { slug: 'year-end-fundraising-campaign', label: 'Year-End Fundraising Campaign' },
  { slug: 'capital-campaign-fundraising', label: 'Capital Campaign Fundraising' },
  { slug: 'scholarship-fundraiser', label: 'Scholarship Fundraiser' },
  { slug: 'youth-program-fundraiser', label: 'Youth Program Fundraiser' },
  { slug: 'animal-shelter-fundraiser', label: 'Animal Shelter Fundraiser' },
  { slug: 'food-bank-fundraiser', label: 'Food Bank Fundraiser' },
  { slug: 'church-mission-fundraiser', label: 'Church Mission Fundraiser' },
  { slug: 'volunteer-recruitment-event', label: 'Volunteer Recruitment Event' },
  { slug: 'membership-drive-fundraiser', label: 'Membership Drive Fundraiser' },
  { slug: 'raffle-fundraising-event', label: 'Raffle Fundraising Event' },
  { slug: 'golf-tournament-fundraiser', label: 'Golf Tournament Fundraiser' },
  { slug: 'bingo-night-fundraiser', label: 'Bingo Night Fundraiser' },
  { slug: 'bake-sale-fundraiser', label: 'Bake Sale Fundraiser' },
  { slug: 'car-wash-fundraiser', label: 'Car Wash Fundraiser' },
  { slug: 'charity-concert-fundraiser', label: 'Charity Concert Fundraiser' },
  { slug: 'art-auction-fundraiser', label: 'Art Auction Fundraiser' },
  { slug: 'book-drive-fundraiser', label: 'Book Drive Fundraiser' },
  { slug: 'backpack-drive-fundraiser', label: 'Backpack Drive Fundraiser' },
  { slug: 'school-supplies-drive', label: 'School Supplies Drive' },
  { slug: 'emergency-relief-fundraiser', label: 'Emergency Relief Fundraiser' },
  { slug: 'monthly-giving-campaign', label: 'Monthly Giving Campaign' },
  { slug: 'matching-gift-campaign', label: 'Matching Gift Campaign' },
  { slug: 'volunteer-thank-you-fundraiser', label: 'Volunteer Thank-You Fundraiser' },
] as const

export type PseoParams = {
  state: string
  city: string
  orgType: string
  topic: string
}

export function getAllPseoParams(): PseoParams[] {
  const items: PseoParams[] = []
  for (const seed of US_STATE_CAPITAL_SEEDS) {
    for (const orgType of ORGANIZATION_TYPES) {
      for (const topic of FUNDRAISING_TOPICS) {
        items.push({
          state: seed.stateSlug,
          city: seed.citySlug,
          orgType: orgType.slug,
          topic: topic.slug,
        })
      }
    }
  }
  return items
}

export function getPseoPageContext(params: PseoParams) {
  const seed = US_STATE_CAPITAL_SEEDS.find(
    (item) => item.stateSlug === params.state && item.citySlug === params.city
  )
  const orgType = ORGANIZATION_TYPES.find((item) => item.slug === params.orgType)
  const topic = FUNDRAISING_TOPICS.find((item) => item.slug === params.topic)
  if (!seed || !orgType || !topic) return null
  return { seed, orgType, topic }
}

export const PSEO_PAGE_COUNT =
  US_STATE_CAPITAL_SEEDS.length * ORGANIZATION_TYPES.length * FUNDRAISING_TOPICS.length
