export type ApiKeyScope = 'standard' | 'admin';

export interface ApiKeyData {
  apiKey: string;
  scope: ApiKeyScope;
}
