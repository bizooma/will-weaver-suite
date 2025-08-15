import { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const CreateAdmin = () => {
  const [isCreating, setIsCreating] = useState(false);

  const createAdminUser = async () => {
    setIsCreating(true);
    try {
      console.log('Starting admin user creation...');
      
      const { data, error } = await supabase.functions.invoke('create-admin-user', {
        body: { 
          email: 'caseyrockwell@hotmail.com', 
          password: 'password2025' 
        }
      });

      console.log('Edge function response:', { data, error });

      if (error) {
        console.error('Error calling create-admin-user function:', error);
        toast.error(`Failed to create admin user: ${error.message}`);
        return;
      }

      if (data?.error) {
        console.error('Function returned error:', data.error);
        toast.error(`Failed to create admin user: ${data.error}`);
        return;
      }

      console.log('✅ Admin user created successfully:', data);
      toast.success(`Admin user created successfully! User ID: ${data.user_id}`);
      
    } catch (error) {
      console.error('❌ Failed to create admin user:', error);
      toast.error(`Failed to create admin user: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="container py-16">
      <h1 className="text-4xl mb-8">Create Admin User</h1>
      <div className="space-y-4">
        <p>This will create an admin user with email: caseyrockwell@hotmail.com</p>
        <Button 
          onClick={createAdminUser} 
          disabled={isCreating}
          variant="hero"
        >
          {isCreating ? 'Creating Admin User...' : 'Create Admin User'}
        </Button>
      </div>
    </div>
  );
};

export default CreateAdmin;