import { apiRequest } from './core';

export const messagesApi = {
  unreadMessages: () => apiRequest<any[]>('/messages/unread'),
  markMessagesRead: (channel: string, messageIds: string[]) => apiRequest<{ success: boolean }>('/messages/read', { method: 'PATCH', body: JSON.stringify({ channel, messageIds }) }),
  privateChatContacts: () => apiRequest<any[]>('/private-chat/contacts'),
  startPrivateChat: (recipientId: string) => apiRequest<any>('/private-chat', { method: 'POST', body: JSON.stringify({ recipientId }) }),
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
