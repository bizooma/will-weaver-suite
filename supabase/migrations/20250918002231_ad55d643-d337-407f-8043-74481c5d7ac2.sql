-- Assign admin role to platform owner joe@bizooma.com
INSERT INTO public.user_roles (user_id, role)
VALUES ('7ea63858-cf76-484f-8715-6c4fb32fce31', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;