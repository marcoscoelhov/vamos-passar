
export interface WebhookConfig {
  id: string;
  name: string;
  url: string;
  events: string[];
  secret_token: string | null;
  is_active: boolean;
  retry_count: number;
  timeout_seconds: number;
  headers: Record<string, string> | null;
  created_at: string;
}

export interface AvailableEvent {
  id: string;
  label: string;
  description: string;
}

export interface NewWebhookData {
  name: string;
  url: string;
  events: string[];
  secret_token: string;
  retry_count: number;
  timeout_seconds: number;
  headers: string;
  is_active: boolean;
}
