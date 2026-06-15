import { apiRequest } from './core';

export const messagesApi = {
  messages: (channel = 'operations') =>
    apiRequest<any[]>(`/messages?channel=${encodeURIComponent(channel)}`),
  sendMessage: (channel: string, content: string) =>
    apiRequest<any>('/messages', { method: 'POST', body: JSON.stringify({ channel, content }) }),
};
