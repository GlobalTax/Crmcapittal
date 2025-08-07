-- Add RLS policies for the new tables

-- ROD Templates policies
CREATE POLICY "Users can view public templates and their own" ON rod_templates
  FOR SELECT USING (is_public = true OR created_by = auth.uid());

CREATE POLICY "Users can create templates" ON rod_templates
  FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update their own templates" ON rod_templates
  FOR UPDATE USING (created_by = auth.uid());

CREATE POLICY "Users can delete their own templates" ON rod_templates
  FOR DELETE USING (created_by = auth.uid());

-- ROD Versions policies
CREATE POLICY "Users can manage ROD versions" ON rod_versions
  FOR ALL USING (created_by = auth.uid());

-- ROD Comments policies
CREATE POLICY "Users can manage ROD comments" ON rod_comments
  FOR ALL USING (created_by = auth.uid());

-- Subscriber segments policies
CREATE POLICY "Users can manage their subscriber segments" ON subscriber_segments
  FOR ALL USING (created_by = auth.uid());

CREATE POLICY "Users can manage segment memberships" ON subscriber_segment_members
  FOR ALL USING (added_by = auth.uid());

-- Campaign analytics policies
CREATE POLICY "System can insert analytics" ON campaign_analytics
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view their campaign analytics" ON campaign_analytics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM campaigns 
      WHERE campaigns.id = campaign_analytics.campaign_id 
      AND campaigns.created_by = auth.uid()
    )
  );

-- AB Tests policies
CREATE POLICY "Users can manage their AB tests" ON campaign_ab_tests
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM campaigns 
      WHERE campaigns.id = campaign_ab_tests.campaign_id 
      AND campaigns.created_by = auth.uid()
    )
  );

-- ROD engagement policies
CREATE POLICY "System can track ROD engagement" ON rod_engagement
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view ROD engagement" ON rod_engagement
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM rod_log 
      WHERE rod_log.id = rod_engagement.rod_log_id 
      AND rod_log.created_by = auth.uid()
    )
  );

-- Subscriber behavior scores policies
CREATE POLICY "System can manage behavior scores" ON subscriber_behavior_scores
  FOR ALL USING (true);

-- Campaign workflows policies
CREATE POLICY "Users can manage their workflows" ON campaign_workflows
  FOR ALL USING (created_by = auth.uid());

-- Triggers for updated_at
CREATE TRIGGER update_rod_templates_updated_at BEFORE UPDATE ON rod_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriber_segments_updated_at BEFORE UPDATE ON subscriber_segments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rod_comments_updated_at BEFORE UPDATE ON rod_comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campaign_workflows_updated_at BEFORE UPDATE ON campaign_workflows
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default ROD templates
INSERT INTO rod_templates (name, description, template_type, template_data, is_public) VALUES
('M&A Semanal', 'Template para reporte semanal de operaciones M&A', 'weekly', '{"sections": ["intro", "new_deals", "mandates", "market_insights", "next_week"], "style": "professional"}', true),
('Tech Sector Focus', 'Template especializado en sector tecnológico', 'sector', '{"sections": ["intro", "tech_deals", "valuations", "trends"], "sector": "technology"}', true),
('Food & Beverage Report', 'Template para sector alimentario', 'sector', '{"sections": ["intro", "fb_deals", "market_analysis", "opportunities"], "sector": "food_beverage"}', true),
('Monthly Overview', 'Resumen mensual completo', 'monthly', '{"sections": ["executive_summary", "deals_closed", "pipeline", "outlook"], "frequency": "monthly"}', true);

-- Insert default subscriber segments
INSERT INTO subscriber_segments (name, description, segment_type, conditions, is_dynamic) VALUES
('High Engagement', 'Suscriptores con alto engagement', 'behavioral', '{"engagement_score": {"min": 80}, "last_opened": {"days": 30}}', true),
('Tech Sector', 'Profesionales del sector tecnológico', 'manual', '{"sector": "technology", "company_type": "buyer"}', false),
('Investment Funds', 'Fondos de inversión y private equity', 'manual', '{"company_type": "fund", "investment_range": {"min": 1000000}}', false),
('New Subscribers', 'Nuevos suscriptores últimos 30 días', 'auto', '{"created_at": {"days": 30}}', true);