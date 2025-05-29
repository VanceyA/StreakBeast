-- Create achievements table
CREATE TABLE IF NOT EXISTS public.achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    hint TEXT,
    trigger_type VARCHAR(50) NOT NULL, -- goal_count, streak_length, completed_count, platform_count
    trigger_value INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_achievements junction table to track which users have unlocked which achievements
CREATE TABLE IF NOT EXISTS public.user_achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    achievement_id UUID NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
    unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, achievement_id)
);

-- Add RLS policies for achievements table
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;

-- Everyone can read achievements
CREATE POLICY "Achievements are viewable by everyone" 
ON public.achievements FOR SELECT USING (true);

-- Only authenticated users can view their own achievements
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own achievements" 
ON public.user_achievements FOR SELECT 
USING (auth.uid() = user_id);

-- Insert default achievements
INSERT INTO public.achievements (name, description, hint, trigger_type, trigger_value) VALUES
('First Steps', 'Create your first goal', 'Create a goal to track your content creation', 'goal_count', 1),
('Goal Setter', 'Create 5 different goals', 'Diversify your content strategy with multiple goals', 'goal_count', 5),
('Content Planner', 'Create 10 different goals', 'Become a content planning expert', 'goal_count', 10),
('Streak Starter', 'Achieve a 3-day streak', 'Complete your goal for 3 consecutive days', 'streak_length', 3),
('Week Warrior', 'Achieve a 7-day streak', 'Complete your goal for a full week', 'streak_length', 7),
('Fortnight Focus', 'Achieve a 14-day streak', 'Maintain your streak for two weeks', 'streak_length', 14),
('Monthly Master', 'Achieve a 30-day streak', 'Keep your streak going for a full month', 'streak_length', 30),
('Quarterly Champion', 'Achieve a 90-day streak', 'Maintain your streak for three months', 'streak_length', 90),
('First Completion', 'Complete a goal for the first time', 'Mark a goal as completed', 'completed_count', 1),
('Completion Collector', 'Complete goals 10 times', 'Regularly complete your content goals', 'completed_count', 10),
('Completion Crusader', 'Complete goals 50 times', 'Become a content completion machine', 'completed_count', 50),
('Platform Pioneer', 'Create goals for 2 different platforms', 'Expand your content to multiple platforms', 'platform_count', 2),
('Platform Pro', 'Create goals for 5 different platforms', 'Become a multi-platform content creator', 'platform_count', 5);
