// DashboardContent: Routes for all dashboard sections with role + tier gating.
// Each route is wrapped in ProtectedContent with the minimum subscription tier required.
import React from "react";
import { Routes, Route } from "react-router-dom";
import { DashboardOverview } from "./DashboardOverview";
import { ChatbotManager } from "./ChatbotManager";
import { WillManager } from "./WillManager";
import { AlexaManager } from "./AlexaManager";
import { MobileManager } from "./MobileManager";
import { AnalyticsManager } from "./AnalyticsManager";
import { FunctionalSettingsManager } from "./FunctionalSettingsManager";
import { AIOManager } from "./AIOManager";
import { ChatbotConversations } from "./ChatbotConversations";
import { QRCodeManager } from "./QRCodeManager";
import { VoiceSearchManager } from "./VoiceSearchManager";
import { UserManagement } from "./UserManagement";
import { SystemMessages } from "./SystemMessages";
import { MarketingCalendar } from "./MarketingCalendar";
import { TrainingManager } from "./TrainingManager";
import { TrainingAdminManager } from "./TrainingAdminManager";
import { ProtectedContent } from "@/components/ProtectedContent";
import LiveOperators from "@/pages/LiveOperators";
import NonprofitFormation from "@/pages/NonprofitFormation";

export function DashboardContent() {
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Routes>
        {/* Overview — available to all authenticated users */}
        <Route path="/" element={<DashboardOverview />} />

        {/* --- Basic tier features --- */}
        <Route path="/aio" element={
          <ProtectedContent
            requiredTier="basic"
            fallbackTitle="AIO Analyzer — Basic Plan & Above"
            fallbackDescription="Analyze your online presence and get AI-powered insights to optimize your legal practice."
          >
            <AIOManager />
          </ProtectedContent>
        } />
        <Route path="/chatbots" element={
          <ProtectedContent
            requiredTier="basic"
            fallbackTitle="Video Chatbots — Basic Plan & Above"
            fallbackDescription="Create intelligent video chatbots to engage with your clients and generate leads 24/7."
          >
            <ChatbotManager />
          </ProtectedContent>
        } />
        <Route path="/chatbots/*" element={
          <ProtectedContent requiredTier="basic">
            <ChatbotManager />
          </ProtectedContent>
        } />
        <Route path="/chatbots/conversations/:chatbotId" element={
          <ProtectedContent requiredTier="basic">
            <ChatbotConversations />
          </ProtectedContent>
        } />
        <Route path="/qr-codes" element={
          <ProtectedContent
            requiredTier="basic"
            fallbackTitle="QR Code Generator — Basic Plan & Above"
            fallbackDescription="Generate trackable QR codes for your marketing campaigns and measure their performance."
          >
            <QRCodeManager />
          </ProtectedContent>
        } />
        <Route path="/marketing-calendar" element={<MarketingCalendar />} />

        {/* --- Standard tier features --- */}
        <Route path="/wills" element={
          <ProtectedContent
            requiredTier="standard"
            fallbackTitle="Will Creator — Standard Plan & Above"
            fallbackDescription="Create professional wills and estate planning documents with AI assistance."
          >
            <WillManager />
          </ProtectedContent>
        } />
        <Route path="/live-operators" element={
          <ProtectedContent
            requiredTier="standard"
            fallbackTitle="Live Operators — Standard Plan & Above"
            fallbackDescription="Monitor and take over chatbot conversations in real-time."
          >
            <LiveOperators />
          </ProtectedContent>
        } />

        {/* --- Pro PI / Pro Estate tier features --- */}
        <Route path="/voice-search" element={
          <ProtectedContent
            requiredTier="pro_pi"
            fallbackTitle="Voice Search Optimizer — Pro Plan & Above"
            fallbackDescription="Optimize your practice for voice search and capture clients using voice assistants."
          >
            <VoiceSearchManager />
          </ProtectedContent>
        } />
        <Route path="/alexa" element={
          <ProtectedContent
            requiredTier="pro_pi"
            fallbackTitle="Alexa Skill — Pro Plan & Above"
            fallbackDescription="Build custom Alexa skills to help clients access legal information through voice."
          >
            <AlexaManager />
          </ProtectedContent>
        } />
        <Route path="/mobile" element={
          <ProtectedContent
            requiredTier="pro_pi"
            fallbackTitle="Mobile App Builder — Pro Plan & Above"
            fallbackDescription="Create a custom mobile app for your law firm to better serve your clients."
          >
            <MobileManager />
          </ProtectedContent>
        } />

        {/* --- Training — available to all --- */}
        <Route path="/training/admin/*" element={
          <ProtectedContent requiredRole="admin">
            <TrainingAdminManager />
          </ProtectedContent>
        } />
        <Route path="/training/*" element={
          <ProtectedContent
            requiredRole="free"
            fallbackTitle="Training Videos — Available to All Users"
            fallbackDescription="Access comprehensive training videos on digital marketing strategies for law firms."
          >
            <TrainingManager />
          </ProtectedContent>
        } />

        {/* --- Nonprofit formation — available to all --- */}
        <Route path="/nonprofit-formation" element={
          <ProtectedContent
            requiredRole="free"
            fallbackTitle="Nonprofit Formation"
            fallbackDescription="Create and manage nonprofit organizations with legal assistance and guidance."
          >
            <NonprofitFormation />
          </ProtectedContent>
        } />

        {/* --- Admin-only sections --- */}
        <Route path="/analytics" element={
          <ProtectedContent requiredRole="admin">
            <AnalyticsManager />
          </ProtectedContent>
        } />
        <Route path="/settings" element={
          <ProtectedContent requiredRole="free">
            <FunctionalSettingsManager />
          </ProtectedContent>
        } />
        <Route path="/users" element={
          <ProtectedContent requiredRole="admin">
            <UserManagement />
          </ProtectedContent>
        } />
        <Route path="/system-messages" element={
          <ProtectedContent requiredRole="admin">
            <SystemMessages />
          </ProtectedContent>
        } />
      </Routes>
    </div>
  );
}
