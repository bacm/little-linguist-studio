-- Create word categories table
CREATE TABLE public.word_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  icon TEXT NOT NULL DEFAULT '📝',
  color TEXT NOT NULL DEFAULT 'primary',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.word_categories ENABLE ROW LEVEL SECURITY;

-- Create policy for word categories (public read access)
CREATE POLICY "Word categories are viewable by everyone" 
ON public.word_categories 
FOR SELECT 
USING (true);

-- Insert default categories
INSERT INTO public.word_categories (name, icon, color) VALUES
('Food', '🍎', 'mint'),
('Animals', '🐶', 'peach'),
('Actions', '💧', 'lavender'),
('Family', '👥', 'primary'),
('Objects', '📦', 'mint');

-- Create words table
CREATE TABLE public.words (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  child_id UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  word TEXT NOT NULL,
  category_id UUID REFERENCES public.word_categories(id),
  date_learned DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.words ENABLE ROW LEVEL SECURITY;

-- Create policies for words
CREATE POLICY "Users can view their own words" 
ON public.words 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create words for their children" 
ON public.words 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own words" 
ON public.words 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own words" 
ON public.words 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create milestones table
CREATE TABLE public.milestones (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  child_id UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  milestone_type TEXT NOT NULL DEFAULT 'vocabulary', -- vocabulary, speech, communication
  target_value INTEGER NOT NULL DEFAULT 1,
  current_value INTEGER NOT NULL DEFAULT 0,
  achieved BOOLEAN NOT NULL DEFAULT false,
  achieved_date DATE,
  icon TEXT NOT NULL DEFAULT '🏆',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;

-- Create policies for milestones
CREATE POLICY "Users can view their own milestones" 
ON public.milestones 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create milestones for their children" 
ON public.milestones 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own milestones" 
ON public.milestones 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own milestones" 
ON public.milestones 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add triggers for automatic timestamp updates
CREATE TRIGGER update_word_categories_updated_at
BEFORE UPDATE ON public.word_categories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_words_updated_at
BEFORE UPDATE ON public.words
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_milestones_updated_at
BEFORE UPDATE ON public.milestones
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some default milestones for new children (we'll create a function for this)
CREATE OR REPLACE FUNCTION create_default_milestones_for_child(child_id UUID, user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert default milestones
  INSERT INTO public.milestones (child_id, user_id, title, description, milestone_type, target_value, icon) VALUES
  (child_id, user_id, 'First Word', 'Baby says their first recognizable word', 'vocabulary', 1, '🗣️'),
  (child_id, user_id, '10 Words', 'Vocabulary reaches 10 words', 'vocabulary', 10, '🏆'),
  (child_id, user_id, '50 Words', 'Vocabulary reaches 50 words', 'vocabulary', 50, '🏆'),
  (child_id, user_id, '100 Words', 'Vocabulary reaches 100 words', 'vocabulary', 100, '🏆'),
  (child_id, user_id, 'First Phrase', 'Baby combines two words into a phrase', 'speech', 1, '💬'),
  (child_id, user_id, 'First Sentence', 'Baby speaks their first complete sentence', 'speech', 1, '📝');
END;
$$;