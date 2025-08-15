import { supabase } from "@/integrations/supabase/client";

export const createAdminUser = async (email: string, password: string) => {
  try {
    console.log('Creating admin user:', email);
    
    const { data, error } = await supabase.functions.invoke('create-admin-user', {
      body: { email, password }
    });

    if (error) {
      console.error('Error calling create-admin-user function:', error);
      throw error;
    }

    if (data?.error) {
      console.error('Function returned error:', data.error);
      throw new Error(data.error);
    }

    console.log('Admin user created successfully:', data);
    return data;
  } catch (error) {
    console.error('Failed to create admin user:', error);
    throw error;
  }
};

// Immediately create the admin user
createAdminUser('caseyrockwell@hotmail.com', 'password2025')
  .then(result => {
    console.log('✅ Admin user creation result:', result);
  })
  .catch(error => {
    console.error('❌ Failed to create admin user:', error);
  });