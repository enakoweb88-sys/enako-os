import { apiRequest } from '../lib/api/core';
export async function askEnakoEngine(prompt: string) {
  const response = await apiRequest<{ text: string }>('/digital/assistant', { method: 'POST', body: JSON.stringify({ prompt }) }, 'json', 30000);
  return response.text;
}
