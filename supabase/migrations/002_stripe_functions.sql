-- Create function to increment campaign amount safely
CREATE OR REPLACE FUNCTION increment_campaign_amount(
  campaign_id UUID,
  amount DECIMAL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update the campaign's current_amount
  UPDATE campaigns 
  SET 
    current_amount = current_amount + amount,
    updated_at = NOW()
  WHERE id = campaign_id;
  
  -- Check if the update affected any rows
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Campaign with id % not found', campaign_id;
  END IF;
END;
$$;

-- Create function to get campaign statistics
CREATE OR REPLACE FUNCTION get_campaign_stats(campaign_id UUID)
RETURNS TABLE(
  total_donations BIGINT,
  total_amount DECIMAL,
  average_donation DECIMAL,
  last_donation TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) as total_donations,
    COALESCE(SUM(amount), 0) as total_amount,
    COALESCE(AVG(amount), 0) as average_donation,
    MAX(created_at) as last_donation
  FROM donations 
  WHERE donations.campaign_id = get_campaign_stats.campaign_id
    AND status = 'completed';
END;
$$;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_donations_campaign_id ON donations(campaign_id);
CREATE INDEX IF NOT EXISTS idx_donations_status ON donations(status);
CREATE INDEX IF NOT EXISTS idx_donations_created_at ON donations(created_at);

-- Add RLS policies for donations
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;

-- Allow users to read donations for campaigns they have access to
CREATE POLICY "Users can view donations for accessible campaigns" ON donations
  FOR SELECT USING (
    campaign_id IN (
      SELECT id FROM campaigns 
      WHERE organization_id IN (
        SELECT organization_id FROM profiles 
        WHERE id = auth.uid()
      )
    )
  );

-- Allow system to insert donations (for webhooks)
CREATE POLICY "System can insert donations" ON donations
  FOR INSERT WITH CHECK (true);

-- Allow system to update donations (for webhooks)
CREATE POLICY "System can update donations" ON donations
  FOR UPDATE USING (true);
