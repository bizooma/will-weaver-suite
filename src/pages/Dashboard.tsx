import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/AppSidebar";
import { DashboardContent } from "@/components/dashboard/DashboardContent";
import { generateMetaTags } from "@/lib/seo";
import { Helmet } from "react-helmet-async";

const Dashboard = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <>
      <Helmet>
        <title>Dashboard - Amicus Edge</title>
        <meta name="description" content="Manage your legal tech tools including video chatbots, will creator, and more" />
      </Helmet>
      
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-background">
          <AppSidebar />
          <main className="flex-1">
            <DashboardContent />
          </main>
        </div>
      </SidebarProvider>
    </>
  );
};

export default Dashboard;