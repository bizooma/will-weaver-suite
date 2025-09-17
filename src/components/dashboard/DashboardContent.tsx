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
import { ProtectedContent } from "@/components/ProtectedContent";

export function DashboardContent() {
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Routes>
        <Route path="/" element={<DashboardOverview />} />
        <Route path="/aio" element={
          <ProtectedContent 
            fallbackTitle="AIO Analyzer - Premium Feature"
            fallbackDescription="Analyze your online presence and get AI-powered insights to optimize your legal practice."
          >
            <AIOManager />
          </ProtectedContent>
        } />
        <Route path="/chatbots" element={
          <ProtectedContent 
            fallbackTitle="Video Chatbots - Premium Feature"
            fallbackDescription="Create intelligent video chatbots to engage with your clients and generate leads 24/7."
          >
            <ChatbotManager />
          </ProtectedContent>
        } />
        <Route path="/chatbots/*" element={
          <ProtectedContent>
            <ChatbotManager />
          </ProtectedContent>
        } />
        <Route path="/chatbots/conversations/:chatbotId" element={
          <ProtectedContent>
            <ChatbotConversations />
          </ProtectedContent>
        } />
        <Route path="/qr-codes" element={
          <ProtectedContent 
            fallbackTitle="QR Code Generator - Premium Feature"
            fallbackDescription="Generate trackable QR codes for your marketing campaigns and measure their performance."
          >
            <QRCodeManager />
          </ProtectedContent>
        } />
        <Route path="/marketing-calendar" element={<MarketingCalendar />} />
        <Route path="/voice-search" element={
          <ProtectedContent 
            fallbackTitle="Voice Search Optimizer - Premium Feature"
            fallbackDescription="Optimize your practice for voice search and capture clients using voice assistants."
          >
            <VoiceSearchManager />
          </ProtectedContent>
        } />
        <Route path="/wills" element={
          <ProtectedContent 
            fallbackTitle="Will Creator - Premium Feature"
            fallbackDescription="Create professional wills and estate planning documents with AI assistance."
          >
            <WillManager />
          </ProtectedContent>
        } />
        <Route path="/alexa" element={
          <ProtectedContent 
            fallbackTitle="Alexa Skill - Premium Feature"
            fallbackDescription="Build custom Alexa skills to help clients access legal information through voice."
          >
            <AlexaManager />
          </ProtectedContent>
        } />
        <Route path="/mobile" element={
          <ProtectedContent 
            fallbackTitle="Mobile App Builder - Premium Feature"
            fallbackDescription="Create a custom mobile app for your law firm to better serve your clients."
          >
            <MobileManager />
          </ProtectedContent>
        } />
        <Route path="/analytics" element={
          <ProtectedContent 
            fallbackTitle="Advanced Analytics - Premium Feature"
            fallbackDescription="Get detailed insights into your marketing performance and client engagement."
          >
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