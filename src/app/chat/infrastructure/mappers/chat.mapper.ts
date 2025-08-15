import { Chat } from '../../domain';
import { ChatResponse } from '../interfaces/chat.interface';

export class ChatMapper {
  static fromResponse(response: ChatResponse): Chat {
    return new Chat({
      id: response._id,
      name: response.name,
      type: response.type,
      ...(response.lastMessage && {
        lastMessage: {
          ...response.lastMessage,
          createdAt: new Date(response.lastMessage.createdAt),
        },
      }),
      unreadCount: response.unreadCount,
      createdAt: new Date(response.createdAt),
      updatedAt: new Date(response.updatedAt),
    });
  }
}
