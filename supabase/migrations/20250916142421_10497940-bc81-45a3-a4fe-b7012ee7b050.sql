-- Create email subscriptions table
CREATE TABLE public.email_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email citext NOT NULL UNIQUE,
  source TEXT DEFAULT 'verification_modal',
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.email_subscriptions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can subscribe with email" 
ON public.email_subscriptions 
FOR INSERT 
WITH CHECK (email IS NOT NULL AND length(email::text) > 5);

CREATE POLICY "Users can view their own subscriptions" 
ON public.email_subscriptions 
FOR SELECT 
USING (auth.uid() = user_id OR auth.email() = email::text);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_email_subscriptions_updated_at
BEFORE UPDATE ON public.email_subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();