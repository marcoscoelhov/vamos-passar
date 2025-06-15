
export interface APIKey {
  id: string;
  name: string;
  key_prefix: string;
  permissions: string[];
  rate_limit: number;
  is_active: boolean;
  last_used_at: string | null;
  expires_at: string | null;
  created_at: string;
}

export interface Permission {
  id: string;
  label: string;
  description: string;
}

export interface NewKeyData {
  name: string;
  permissions: string[];
  rate_limit: number;
  expires_at: string;
}
