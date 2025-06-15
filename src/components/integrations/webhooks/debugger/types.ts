
export interface WebhookLog {
  id: string;
  event_type: string;
  status_code?: number;
  created_at: string;
  payload: any;
  error_message?: string;
  webhook_config_id?: string;
}

export interface WebhookConfig {
  id: string;
  name: string;
  url: string;
  is_active: boolean;
  events: string[];
  created_at: string;
}
