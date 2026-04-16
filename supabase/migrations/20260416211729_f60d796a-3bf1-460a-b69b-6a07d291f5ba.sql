
-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles viewable by owner" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Profiles insert by owner" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Profiles update by owner" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Timestamp trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Habits table
CREATE TABLE public.habits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  emoji TEXT NOT NULL DEFAULT '💪',
  color TEXT NOT NULL,
  frequency TEXT NOT NULL DEFAULT 'daily',
  custom_days INTEGER[],
  reminder_time TEXT,
  goal INTEGER,
  notes TEXT,
  completed_dates TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Habits select own" ON public.habits FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Habits insert own" ON public.habits FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Habits update own" ON public.habits FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Habits delete own" ON public.habits FOR DELETE USING (auth.uid() = user_id);
CREATE INDEX idx_habits_user_id ON public.habits(user_id);
CREATE TRIGGER update_habits_updated_at BEFORE UPDATE ON public.habits
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Soft 75 challenges
CREATE TABLE public.soft75_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.soft75_challenges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Challenges select own" ON public.soft75_challenges FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Challenges insert own" ON public.soft75_challenges FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Challenges update own" ON public.soft75_challenges FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Challenges delete own" ON public.soft75_challenges FOR DELETE USING (auth.uid() = user_id);
CREATE INDEX idx_soft75_challenges_user_id ON public.soft75_challenges(user_id);
CREATE TRIGGER update_soft75_challenges_updated_at BEFORE UPDATE ON public.soft75_challenges
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Soft 75 rules
CREATE TABLE public.soft75_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id UUID NOT NULL REFERENCES public.soft75_challenges(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  emoji TEXT,
  description TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  archived_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.soft75_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Rules select own" ON public.soft75_rules FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.soft75_challenges c WHERE c.id = challenge_id AND c.user_id = auth.uid()));
CREATE POLICY "Rules insert own" ON public.soft75_rules FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.soft75_challenges c WHERE c.id = challenge_id AND c.user_id = auth.uid()));
CREATE POLICY "Rules update own" ON public.soft75_rules FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.soft75_challenges c WHERE c.id = challenge_id AND c.user_id = auth.uid()));
CREATE POLICY "Rules delete own" ON public.soft75_rules FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.soft75_challenges c WHERE c.id = challenge_id AND c.user_id = auth.uid()));
CREATE INDEX idx_soft75_rules_challenge_id ON public.soft75_rules(challenge_id);

-- Soft 75 daily logs
CREATE TABLE public.soft75_daily_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id UUID NOT NULL REFERENCES public.soft75_challenges(id) ON DELETE CASCADE,
  rule_id UUID NOT NULL REFERENCES public.soft75_rules(id) ON DELETE CASCADE,
  log_date DATE NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(challenge_id, rule_id, log_date)
);
ALTER TABLE public.soft75_daily_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Logs select own" ON public.soft75_daily_logs FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.soft75_challenges c WHERE c.id = challenge_id AND c.user_id = auth.uid()));
CREATE POLICY "Logs insert own" ON public.soft75_daily_logs FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.soft75_challenges c WHERE c.id = challenge_id AND c.user_id = auth.uid()));
CREATE POLICY "Logs update own" ON public.soft75_daily_logs FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.soft75_challenges c WHERE c.id = challenge_id AND c.user_id = auth.uid()));
CREATE POLICY "Logs delete own" ON public.soft75_daily_logs FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.soft75_challenges c WHERE c.id = challenge_id AND c.user_id = auth.uid()));
CREATE INDEX idx_soft75_logs_challenge_date ON public.soft75_daily_logs(challenge_id, log_date);
