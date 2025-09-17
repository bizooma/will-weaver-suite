-- Assign admin role to joe@bizooma.com
DO $$
DECLARE 
    admin_user_id uuid;
BEGIN
    -- Get the user ID for joe@bizooma.com
    SELECT id INTO admin_user_id 
    FROM auth.users 
    WHERE email = 'joe@bizooma.com';
    
    -- If user exists, assign admin role
    IF admin_user_id IS NOT NULL THEN
        INSERT INTO public.user_roles (user_id, role)
        VALUES (admin_user_id, 'admin'::app_role)
        ON CONFLICT (user_id, role) DO NOTHING;
    END IF;
END $$;

-- Create system_notifications table
CREATE TABLE public.system_notifications (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    created_by UUID NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on system_notifications
ALTER TABLE public.system_notifications ENABLE ROW LEVEL SECURITY;

-- Create policies for system_notifications
CREATE POLICY "Admins can manage system notifications" 
ON public.system_notifications 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view active system notifications" 
ON public.system_notifications 
FOR SELECT 
USING (is_active = true);

-- Create user_notifications table
CREATE TABLE public.user_notifications (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    notification_id UUID NOT NULL REFERENCES public.system_notifications(id) ON DELETE CASCADE,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(user_id, notification_id)
);

-- Enable RLS on user_notifications
ALTER TABLE public.user_notifications ENABLE ROW LEVEL SECURITY;

-- Create policies for user_notifications
CREATE POLICY "Users can manage their own notification status" 
ON public.user_notifications 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Add cancelled_at column to user_subscriptions
ALTER TABLE public.user_subscriptions 
ADD COLUMN cancelled_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN purchase_date TIMESTAMP WITH TIME ZONE DEFAULT created_at;

-- Update existing records to set purchase_date from created_at
UPDATE public.user_subscriptions 
SET purchase_date = created_at 
WHERE purchase_date IS NULL;

-- Create triggers for updated_at
CREATE TRIGGER update_system_notifications_updated_at
    BEFORE UPDATE ON public.system_notifications
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for notifications
ALTER TABLE public.system_notifications REPLICA IDENTITY FULL;
ALTER TABLE public.user_notifications REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.system_notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_notifications;