-- Migration: Add social media achievements
-- This migration adds new achievements related to social media integration

-- Insert social media related achievements
INSERT INTO public.achievements (id, name, description, icon, trigger_type, trigger_value, category, created_at)
VALUES 
  (gen_random_uuid(), 'Social Butterfly', 'Connect your first social media account', 'butterfly', 'platform_count', 1, 'social', NOW()),
  (gen_random_uuid(), 'Social Network', 'Connect 3 different social media platforms', 'network', 'platform_count', 3, 'social', NOW()),
  (gen_random_uuid(), 'Social Omnipresence', 'Connect all available social media platforms', 'globe', 'platform_count', 5, 'social', NOW()),
  (gen_random_uuid(), 'Content Creator', 'Generate your first content suggestion', 'lightbulb', 'suggestion_count', 1, 'social', NOW()),
  (gen_random_uuid(), 'Content Machine', 'Generate 10 content suggestions', 'robot', 'suggestion_count', 10, 'social', NOW()),
  (gen_random_uuid(), 'Viral Potential', 'Reach 1,000 followers across all platforms', 'chart-line-up', 'follower_count', 1000, 'social', NOW()),
  (gen_random_uuid(), 'Influencer Status', 'Reach 10,000 followers across all platforms', 'star', 'follower_count', 10000, 'social', NOW()),
  (gen_random_uuid(), 'Engagement Master', 'Achieve 20% engagement rate on a post', 'fire', 'engagement_rate', 20, 'social', NOW());
