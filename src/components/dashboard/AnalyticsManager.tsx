import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingUp, Users, MessageSquare, FileText, Smartphone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export function AnalyticsManager() {
  const [stats, setStats] = useState({
    chatbots: 0,
    conversations: 0,
    willDrafts: 0,
    qrScans: 0,
    loading: true
  });

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Fetch real analytics data
        const [chatbotsRes, conversationsRes, willsRes, scansRes] = await Promise.all([
          supabase.from('chatbots').select('id', { count: 'exact' }).eq('user_id', user.id),
          supabase.from('chatbot_conversations').select('id', { count: 'exact' }).in('chatbot_id', 
            (await supabase.from('chatbots').select('id').eq('user_id', user.id)).data?.map(c => c.id) || []
          ),
          supabase.from('will_drafts').select('id', { count: 'exact' }).eq('user_id', user.id),
          supabase.from('qr_scans').select('id', { count: 'exact' }).in('qr_code_id',
            (await supabase.from('qr_codes').select('id').eq('user_id', user.id)).data?.map(q => q.id) || []
          )
        ]);

        setStats({
          chatbots: chatbotsRes.count || 0,
          conversations: conversationsRes.count || 0,
          willDrafts: willsRes.count || 0,
          qrScans: scansRes.count || 0,
          loading: false
        });
      } catch (error) {
        console.error('Error fetching analytics:', error);
        setStats(prev => ({ ...prev, loading: false }));
      }
    };

    fetchAnalytics();
  }, []);

  return (
    <div className="flex-1 space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
        <p className="text-muted-foreground">
          Performance insights for your legal tech tools
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Chatbots</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.loading ? '-' : stats.chatbots}</div>
            <p className="text-xs text-muted-foreground">
              Active chatbots created
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversations</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.loading ? '-' : stats.conversations}</div>
            <p className="text-xs text-muted-foreground">
              Total chatbot interactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Will Drafts</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.loading ? '-' : stats.willDrafts}</div>
            <p className="text-xs text-muted-foreground">
              Documents created
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">QR Code Scans</CardTitle>
            <Smartphone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.loading ? '-' : stats.qrScans}</div>
            <p className="text-xs text-muted-foreground">
              Total scans tracked
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Usage Distribution</CardTitle>
            <CardDescription>
              Your activity across different tools
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.loading ? (
                <div className="text-center text-muted-foreground">Loading usage data...</div>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-blue-500" />
                      <span className="text-sm">Chatbots</span>
                    </div>
                    <span className="text-sm font-medium">{stats.chatbots} created</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Will Drafts</span>
                    </div>
                    <span className="text-sm font-medium">{stats.willDrafts} documents</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-purple-500" />
                      <span className="text-sm">Conversations</span>
                    </div>
                    <span className="text-sm font-medium">{stats.conversations} total</span>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Growth Opportunities</CardTitle>
            <CardDescription>
              Suggestions to maximize your legal tech impact
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 border rounded-lg">
                <div>
                  <p className="text-sm font-medium">Create More Chatbots</p>
                  <p className="text-xs text-muted-foreground">Automate different practice areas</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-blue-600">Recommended</p>
                </div>
              </div>

              <div className="flex justify-between items-center p-3 border rounded-lg">
                <div>
                  <p className="text-sm font-medium">Track QR Codes</p>
                  <p className="text-xs text-muted-foreground">Monitor marketing effectiveness</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-green-600">Opportunity</p>
                </div>
              </div>

              <div className="flex justify-between items-center p-3 border rounded-lg">
                <div>
                  <p className="text-sm font-medium">SEO Analysis</p>
                  <p className="text-xs text-muted-foreground">Optimize for voice search</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-purple-600">New Feature</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}