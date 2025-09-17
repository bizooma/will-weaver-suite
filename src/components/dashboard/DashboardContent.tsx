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

export function DashboardContent() {
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Routes>
        <Route path="/" element={<DashboardOverview />} />
        <Route path="/aio" element={<AIOManager />} />
        <Route path="/chatbots" element={<ChatbotManager />} />
        <Route path="/chatbots/*" element={<ChatbotManager />} />
        <Route path="/chatbots/conversations/:chatbotId" element={<ChatbotConversations />} />
        <Route path="/qr-codes" element={<QRCodeManager />} />
        <Route path="/wills" element={<WillManager />} />
        <Route path="/alexa" element={<AlexaManager />} />
        <Route path="/mobile" element={<MobileManager />} />
        <Route path="/analytics" element={<AnalyticsManager />} />
        <Route path="/settings" element={<FunctionalSettingsManager />} />
      </Routes>
    </div>
  );
}