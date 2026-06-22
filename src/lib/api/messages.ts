import { apiRequest } from './core';

export const messagesApi = {
  messages: (channel = 'general') =>
    apiRequest<any[]>(`/messages?channel=${encodeURIComponent(channel)}`),
  sendMessage: (channel: string, content: string) =>
    apiRequest<any>('/messages', { method: 'POST', body: JSON.stringify({ channel, content }) }),

  getChannels: () => apiRequest<any[]>('/channels'),
  createChannel: (name: string, description?: string) =>
    apiRequest<any>('/channels', { method: 'POST', body: JSON.stringify({ name, description }) }),
  getChannelMembers: (channelName: string) =>
    apiRequest<any[]>(`/channels/${encodeURIComponent(channelName)}/members`),
  addChannelMember: (channelName: string, userId: string) =>
    apiRequest<any>(`/channels/${encodeURIComponent(channelName)}/members`, { method: 'POST', body: JSON.stringify({ userId }) }),
  removeChannelMember: (channelName: string, userId: string) =>
    apiRequest<any>(`/channels/${encodeURIComponent(channelName)}/members/${userId}`, { method: 'DELETE' }),
};
