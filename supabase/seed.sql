-- Seed data for EventraiseHub

-- Insert sample organizations
INSERT INTO public.organizations (id, name, description, address, city, state, zip_code, phone, email, website, logo_url) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'Lincoln Elementary School', 'A community-focused elementary school dedicated to providing quality education and fostering student growth.', '123 Education Street', 'Springfield', 'IL', '62701', '(555) 123-4567', 'contact@lincolnelementary.edu', 'https://lincolnelementary.edu', 'https://example.com/logo1.png'),
  ('550e8400-e29b-41d4-a716-446655440002', 'Roosevelt High School', 'Preparing students for success in college and career through innovative programs and dedicated faculty.', '456 Learning Avenue', 'Springfield', 'IL', '62702', '(555) 234-5678', 'info@roosevelthigh.edu', 'https://roosevelthigh.edu', 'https://example.com/logo2.png'),
  ('550e8400-e29b-41d4-a716-446655440003', 'Community Arts Center', 'Supporting local artists and providing cultural enrichment programs for the community.', '789 Creative Lane', 'Springfield', 'IL', '62703', '(555) 345-6789', 'hello@communityarts.org', 'https://communityarts.org', 'https://example.com/logo3.png');

-- Insert sample campaigns
INSERT INTO public.campaigns (id, title, description, goal_amount, current_amount, status, start_date, end_date, organization_id, created_by, category, image_url, is_featured) VALUES
  ('660e8400-e29b-41d4-a716-446655440001', 'Spring Playground Renovation', 'Help us create a safe and fun playground for our students. We need to replace old equipment, add new play structures, and improve safety surfacing.', 25000.00, 18750.00, 'active', '2024-03-01T00:00:00Z', '2024-06-30T23:59:59Z', '550e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440001', 'Education', 'https://example.com/playground.jpg', true),
  ('660e8400-e29b-41d4-a716-446655440002', 'School Technology Upgrade', 'Modernize our computer labs and provide tablets for every student to enhance digital learning.', 50000.00, 32000.00, 'active', '2024-02-15T00:00:00Z', '2024-08-31T23:59:59Z', '550e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440001', 'Education', 'https://example.com/technology.jpg', false),
  ('660e8400-e29b-41d4-a716-446655440003', 'Library Book Drive', 'Expand our library collection with new books, e-books, and educational resources for all grade levels.', 15000.00, 8500.00, 'active', '2024-01-01T00:00:00Z', '2024-12-31T23:59:59Z', '550e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440001', 'Education', 'https://example.com/library.jpg', false),
  ('660e8400-e29b-41d4-a716-446655440004', 'Arts Program Expansion', 'Support our arts program with new instruments, art supplies, and visiting artist workshops.', 20000.00, 12000.00, 'active', '2024-02-01T00:00:00Z', '2024-07-31T23:59:59Z', '550e8400-e29b-41d4-a716-446655440003', '770e8400-e29b-41d4-a716-446655440002', 'Arts & Culture', 'https://example.com/arts.jpg', true);

-- Insert sample events
INSERT INTO public.events (id, title, description, event_type, start_date, end_date, location, max_participants, current_participants, ticket_price, campaign_id, organization_id, created_by, image_url, is_featured) VALUES
  ('760e8400-e29b-41d4-a716-446655440001', 'Spring Charity Walkathon 2024', 'Join us for our annual 5K walkathon to raise funds for the school playground renovation. This family-friendly event includes a scenic route through the park, refreshments, and prizes for top fundraisers.', 'walkathon', '2024-04-15T09:00:00Z', '2024-04-15T12:00:00Z', 'Central Park, Main Entrance', 200, 127, 25.00, '660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440001', 'https://example.com/walkathon.jpg', true),
  ('760e8400-e29b-41d4-a716-446655440002', 'Silent Auction Gala', 'Elegant evening with fine dining and exclusive auction items. All proceeds support our technology upgrade initiative.', 'auction', '2024-04-20T18:00:00Z', '2024-04-20T23:00:00Z', 'Grand Ballroom, Downtown', 150, 89, 75.00, '660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440001', 'https://example.com/gala.jpg', false),
  ('760e8400-e29b-41d4-a716-446655440003', 'Bake Sale for Education', 'Delicious homemade treats supporting our library book drive. Join us for a day of community and learning.', 'product_sale', '2024-04-10T10:00:00Z', '2024-04-10T16:00:00Z', 'Community Center', 50, 32, 0.00, '660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440001', 'https://example.com/bakesale.jpg', false);

-- Insert sample volunteer opportunities
INSERT INTO public.volunteer_opportunities (id, title, description, event_id, campaign_id, required_skills, time_commitment, location, max_volunteers, current_volunteers, start_time, end_time, created_by) VALUES
  ('860e8400-e29b-41d4-a716-446655440001', 'Event Setup Crew', 'Help set up tables, chairs, and decorations for the charity auction', '760e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440002', ARRAY['Physical labor', 'Teamwork'], '4 hours', 'Grand Ballroom, Downtown', 10, 7, '2024-04-20T14:00:00Z', '2024-04-20T18:00:00Z', '770e8400-e29b-41d4-a716-446655440001'),
  ('860e8400-e29b-41d4-a716-446655440002', 'Registration Desk', 'Welcome guests and handle event registration', '760e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440002', ARRAY['Customer service', 'Organization'], '3 hours', 'Main Entrance', 4, 3, '2024-04-20T17:00:00Z', '2024-04-20T20:00:00Z', '770e8400-e29b-41d4-a716-446655440001'),
  ('860e8400-e29b-41d4-a716-446655440003', 'Walkathon Route Marshals', 'Guide participants along the 5K route and provide encouragement', '760e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', ARRAY['Enthusiasm', 'Safety awareness'], '2 hours', 'Central Park Route', 15, 12, '2024-04-15T08:00:00Z', '2024-04-15T10:00:00Z', '770e8400-e29b-41d4-a716-446655440001');

-- Insert sample donations
INSERT INTO public.donations (id, campaign_id, event_id, amount, currency, status, donor_name, donor_email, is_anonymous, message, created_at) VALUES
  ('960e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', NULL, 100.00, 'USD', 'completed', 'John Smith', 'john@example.com', false, 'Great cause! Happy to support our school.', '2024-03-15T10:30:00Z'),
  ('960e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440001', NULL, 250.00, 'USD', 'completed', NULL, NULL, true, 'Thank you for this amazing cause!', '2024-03-16T14:20:00Z'),
  ('960e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440002', NULL, 500.00, 'USD', 'completed', 'Sarah Johnson', 'sarah@example.com', false, 'Happy to support our school technology!', '2024-03-17T09:15:00Z'),
  ('960e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440003', NULL, 75.00, 'USD', 'completed', 'Mike Chen', 'mike@example.com', false, 'Love supporting education!', '2024-03-18T16:45:00Z');

-- Insert sample volunteer signups
INSERT INTO public.volunteer_signups (id, opportunity_id, volunteer_name, volunteer_email, volunteer_phone, emergency_contact, emergency_phone, experience, availability, notes, status, signed_up_at) VALUES
  ('a60e8400-e29b-41d4-a716-446655440001', '860e8400-e29b-41d4-a716-446655440001', 'Sarah Johnson', 'sarah@example.com', '(555) 111-2222', 'Tom Johnson', '(555) 111-2223', 'Has experience with event setup', 'Available for early setup', 'Can bring extra tools', 'confirmed', '2024-03-10T10:00:00Z'),
  ('a60e8400-e29b-41d4-a716-446655440002', '860e8400-e29b-41d4-a716-446655440001', 'Mike Chen', 'mike@example.com', '(555) 222-3333', 'Lisa Chen', '(555) 222-3334', 'Available for early setup', 'Available for early setup', 'Can help with heavy lifting', 'pending', '2024-03-11T14:30:00Z'),
  ('a60e8400-e29b-41d4-a716-446655440003', '860e8400-e29b-41d4-a716-446655440003', 'Emily Davis', 'emily@example.com', '(555) 333-4444', 'Robert Davis', '(555) 333-4445', 'Former track runner', 'Available all day', 'Excited to help with the walkathon!', 'confirmed', '2024-03-12T09:15:00Z');

-- Insert sample event participants
INSERT INTO public.event_participants (id, event_id, participant_name, participant_email, participant_phone, ticket_quantity, special_requests, created_at) VALUES
  ('b60e8400-e29b-41d4-a716-446655440001', '760e8400-e29b-41d4-a716-446655440001', 'Alice Wilson', 'alice@example.com', '(555) 444-5555', 2, 'Vegetarian meal option', '2024-03-20T11:30:00Z'),
  ('b60e8400-e29b-41d4-a716-446655440002', '760e8400-e29b-41d4-a716-446655440001', 'Bob Anderson', 'bob@example.com', '(555) 555-6666', 1, 'Wheelchair accessible route', '2024-03-21T15:45:00Z'),
  ('b60e8400-e29b-41d4-a716-446655440003', '760e8400-e29b-41d4-a716-446655440002', 'Carol Brown', 'carol@example.com', '(555) 666-7777', 1, 'Table for 4', '2024-03-22T12:20:00Z');

-- Insert sample notifications
INSERT INTO public.notifications (id, user_id, title, message, type, is_read, created_at) VALUES
  ('c60e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440001', 'New Donation Received', 'A donation of $100 was received for Spring Playground Renovation', 'donation', false, '2024-03-15T10:35:00Z'),
  ('c60e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440001', 'Volunteer Signed Up', 'Sarah Johnson signed up for Event Setup Crew', 'volunteer', false, '2024-03-10T10:05:00Z'),
  ('c60e8400-e29b-41d4-a716-446655440003', '770e8400-e29b-41d4-a716-446655440001', 'Campaign Milestone', 'Spring Playground Renovation reached 75% of its goal!', 'milestone', false, '2024-03-18T16:50:00Z');
