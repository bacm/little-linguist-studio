-- Create children table
CREATE TABLE public.children (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  birthdate DATE NOT NULL,
  avatar TEXT NOT NULL DEFAULT '👶',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.children ENABLE ROW LEVEL SECURITY;

-- Create policies for children table
CREATE POLICY "Users can view their own children" 
ON public.children 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create children for themselves" 
ON public.children 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own children" 
ON public.children 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own children" 
ON public.children 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_children_updated_at
BEFORE UPDATE ON public.children
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();