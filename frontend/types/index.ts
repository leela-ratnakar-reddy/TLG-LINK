export interface URLItem {
  short_code: string;
  short_url: string;
  original_url: string;
  created_at: string;
  expires_at: string | null;
  click_count: number;
  is_expired: boolean;
  analytics_url: string;
  analytics_token: string;
}

export interface URLCreatePayload {
  url: string;
  expires_at?: string | null;
  custom_alias?: string | null;
}

export interface TimelinePoint {
  date: string;
  clicks: number;
}

export interface CategoryBreakdown {
  label: string;
  count: number;
  percentage: number;
}

export interface RecentClickItem {
  timestamp: string;
  device: string;
  browser: string;
  os: string;
  referrer: string | null;
}

export interface LinkAnalytics {
  short_code: string;
  short_url: string;
  original_url: string;
  created_at: string;
  expires_at: string | null;
  is_expired: boolean;
  total_clicks: number;
  clicks_today: number;
  clicks_7d: number;
  clicks_30d: number;
  timeline: TimelinePoint[];
  devices: CategoryBreakdown[];
  browsers: CategoryBreakdown[];
  operating_systems: CategoryBreakdown[];
  referrers: CategoryBreakdown[];
  recent_activity: RecentClickItem[];
}

export type ToastType = "success" | "error" | "info" | "warning";

export interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}
