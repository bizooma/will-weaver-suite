/**
 * QRCodeAnalyticsDashboard – full-featured analytics view for a single QR code.
 *
 * Visualises geographic breakdown, device / browser / OS detection,
 * referrer sources, unique-vs-repeat visitors, daily trend lines,
 * and an hourly activity heatmap — all powered by Recharts.
 */

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Globe, Smartphone, Monitor, Tablet, Users, UserCheck, UserPlus,
  TrendingUp, BarChart3, ArrowLeft, Link2, Clock,
} from "lucide-react";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  Area, AreaChart,
} from "recharts";

/* ── Types ─────────────────────────────────────────────────────── */

interface BreakdownItem {
  name: string;
  value: number;
}

export interface QRAnalyticsData {
  qrCode: { id: string; name: string };
  totalScans: number;
  scansToday: number;
  scansLastWeek: number;
  uniqueVisitors: number;
  repeatVisitors: number;
  topCountries: BreakdownItem[];
  topRegions: BreakdownItem[];
  topCities: BreakdownItem[];
  deviceBreakdown: BreakdownItem[];
  browserBreakdown: BreakdownItem[];
  osBreakdown: BreakdownItem[];
  referrerBreakdown: BreakdownItem[];
  dailyTrend: Array<{ date: string; scans: number; uniqueIps: number }>;
  hourlyScans: Array<{ hour: number; count: number }>;
  recentScans: Array<{
    scanned_at: string;
    country: string | null;
    region: string | null;
    city: string | null;
    device: string;
    browser: string;
    os: string;
    referrer: string | null;
  }>;
}

interface Props {
  data: QRAnalyticsData;
  onBack: () => void;
}

/* ── Palette for pie / bar charts ──────────────────────────────── */
const COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--chart-2, 200 80% 50%))",
  "hsl(var(--chart-3, 150 60% 45%))",
  "hsl(var(--chart-4, 40 90% 55%))",
  "hsl(var(--chart-5, 330 70% 50%))",
  "hsl(280 60% 55%)",
  "hsl(20 80% 55%)",
  "hsl(60 70% 45%)",
];

/* ── Helpers ───────────────────────────────────────────────────── */

/** Format "2025-02-20" → "Feb 20" */
function shortDate(iso: string) {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/** Format hour number → "3 PM" */
function formatHour(h: number) {
  if (h === 0) return "12 AM";
  if (h === 12) return "12 PM";
  return h > 12 ? `${h - 12} PM` : `${h} AM`;
}

/* ── Stat Card ─────────────────────────────────────────────────── */

function StatCard({ label, value, icon: Icon, sub }: { label: string; value: number | string; icon: React.ElementType; sub?: string }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{label}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
      </CardContent>
    </Card>
  );
}

/* ── Horizontal bar list (reusable for geo / referrer) ─────────── */

function HorizontalBars({ items, color = "hsl(var(--primary))" }: { items: BreakdownItem[]; color?: string }) {
  if (!items.length) return <p className="text-sm text-muted-foreground">No data yet</p>;
  const max = Math.max(...items.map(i => i.value));

  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-3">
          {/* Label */}
          <span className="text-sm w-28 truncate shrink-0">{item.name}</span>
          {/* Bar */}
          <div className="flex-1 h-5 rounded bg-muted overflow-hidden">
            <div
              className="h-full rounded transition-all"
              style={{ width: `${(item.value / max) * 100}%`, backgroundColor: color }}
            />
          </div>
          {/* Count */}
          <span className="text-sm font-medium w-10 text-right">{item.value}</span>
        </div>
      ))}
    </div>
  );
}

/* ── Main Component ────────────────────────────────────────────── */

export function QRCodeAnalyticsDashboard({ data, onBack }: Props) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold">Analytics — {data.qrCode.name}</h2>
          <p className="text-muted-foreground text-sm">
            Comprehensive scan performance insights for your law firm's QR campaign
          </p>
        </div>
      </div>

      {/* ── KPI cards ──────────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="Total Scans" value={data.totalScans} icon={BarChart3} sub="All time" />
        <StatCard label="Today" value={data.scansToday} icon={TrendingUp} sub="Last 24 hours" />
        <StatCard label="This Week" value={data.scansLastWeek} icon={Clock} sub="Last 7 days" />
        <StatCard label="Unique Visitors" value={data.uniqueVisitors} icon={UserPlus} sub="By IP address" />
        <StatCard label="Repeat Visitors" value={data.repeatVisitors} icon={UserCheck} sub="Scanned 2+ times" />
      </div>

      {/* ── Daily trend (area chart) ───────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><TrendingUp className="h-4 w-4" /> 30-Day Scan Trend</CardTitle>
          <CardDescription>Daily scans &amp; unique visitors over the last 30 days</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.dailyTrend}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="date" tickFormatter={shortDate} tick={{ fontSize: 11 }} className="text-muted-foreground" />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} className="text-muted-foreground" />
                <Tooltip
                  labelFormatter={(v) => shortDate(v as string)}
                  contentStyle={{ borderRadius: 8, border: '1px solid hsl(var(--border))' }}
                />
                <Legend />
                <Area type="monotone" dataKey="scans" name="Total Scans" stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.15)" strokeWidth={2} />
                <Area type="monotone" dataKey="uniqueIps" name="Unique Visitors" stroke="hsl(var(--chart-2, 200 80% 50%))" fill="hsl(var(--chart-2, 200 80% 50%) / 0.10)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* ── Hourly distribution ────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Clock className="h-4 w-4" /> Hourly Activity (Last 24h)</CardTitle>
          <CardDescription>When visitors are scanning your QR code</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.hourlyScans}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="hour" tickFormatter={formatHour} tick={{ fontSize: 10 }} className="text-muted-foreground" />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} className="text-muted-foreground" />
                <Tooltip labelFormatter={(v) => formatHour(v as number)} contentStyle={{ borderRadius: 8, border: '1px solid hsl(var(--border))' }} />
                <Bar dataKey="count" name="Scans" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* ── Device / Browser / OS row ──────────────────────────── */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Device pie */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Smartphone className="h-4 w-4" /> Device Type</CardTitle>
          </CardHeader>
          <CardContent>
            {data.deviceBreakdown.length ? (
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={data.deviceBreakdown} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={40} outerRadius={75} paddingAngle={3} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                      {data.deviceBreakdown.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No data yet</p>
            )}
          </CardContent>
        </Card>

        {/* Browser pie */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Monitor className="h-4 w-4" /> Browser</CardTitle>
          </CardHeader>
          <CardContent>
            {data.browserBreakdown.length ? (
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={data.browserBreakdown} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={40} outerRadius={75} paddingAngle={3} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                      {data.browserBreakdown.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No data yet</p>
            )}
          </CardContent>
        </Card>

        {/* OS pie */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Tablet className="h-4 w-4" /> Operating System</CardTitle>
          </CardHeader>
          <CardContent>
            {data.osBreakdown.length ? (
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={data.osBreakdown} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={40} outerRadius={75} paddingAngle={3} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                      {data.osBreakdown.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No data yet</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Geographic + Referrer row ──────────────────────────── */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Geographic */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Globe className="h-4 w-4" /> Geographic Breakdown</CardTitle>
            <CardDescription>Top locations where your QR code is scanned</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Countries */}
            <div>
              <h4 className="text-sm font-semibold mb-2">Countries</h4>
              <HorizontalBars items={data.topCountries} />
            </div>
            <Separator />
            {/* Cities */}
            <div>
              <h4 className="text-sm font-semibold mb-2">Cities</h4>
              <HorizontalBars items={data.topCities} color="hsl(var(--chart-3, 150 60% 45%))" />
            </div>
          </CardContent>
        </Card>

        {/* Referrers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Link2 className="h-4 w-4" /> Referrer Sources</CardTitle>
            <CardDescription>Where visitors came from before scanning</CardDescription>
          </CardHeader>
          <CardContent>
            <HorizontalBars items={data.referrerBreakdown} color="hsl(var(--chart-4, 40 90% 55%))" />
          </CardContent>
        </Card>
      </div>

      {/* ── Unique vs Repeat card ──────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Users className="h-4 w-4" /> Visitor Breakdown</CardTitle>
          <CardDescription>Unique vs repeat visitors based on IP address</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-52 max-w-sm mx-auto">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: "First-time", value: data.uniqueVisitors - data.repeatVisitors },
                    { name: "Returning", value: data.repeatVisitors },
                  ]}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  <Cell fill="hsl(var(--primary))" />
                  <Cell fill="hsl(var(--chart-2, 200 80% 50%))" />
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* ── Recent scans table ─────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Scans</CardTitle>
          <CardDescription>Last 20 scans with enriched metadata</CardDescription>
        </CardHeader>
        <CardContent>
          {data.recentScans.length === 0 ? (
            <p className="text-sm text-muted-foreground">No scans recorded yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-2 pr-4">Time</th>
                    <th className="pb-2 pr-4">Location</th>
                    <th className="pb-2 pr-4">Device</th>
                    <th className="pb-2 pr-4">Browser</th>
                    <th className="pb-2 pr-4">OS</th>
                    <th className="pb-2">Referrer</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentScans.map((scan, i) => (
                    <tr key={i} className="border-b border-border/50 last:border-0">
                      <td className="py-2 pr-4 whitespace-nowrap">{new Date(scan.scanned_at).toLocaleString()}</td>
                      <td className="py-2 pr-4 whitespace-nowrap">
                        {[scan.city, scan.region, scan.country].filter(Boolean).join(", ") || "Unknown"}
                      </td>
                      <td className="py-2 pr-4">
                        <Badge variant="outline" className="text-xs">{scan.device}</Badge>
                      </td>
                      <td className="py-2 pr-4">{scan.browser}</td>
                      <td className="py-2 pr-4">{scan.os}</td>
                      <td className="py-2 truncate max-w-[160px]">{scan.referrer || "Direct"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
