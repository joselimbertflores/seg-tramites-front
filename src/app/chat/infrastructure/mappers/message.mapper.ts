import { Message } from '../../domain';
import { MessageResponse } from '../interfaces/message.interface';

export class MessageMapper {
  static fromResponse(response: MessageResponse): Message {
    const { sender, sentAt: createdAt, updatedAt, _id, ...props } = response;
    return new Message({
      id: response._id,
      ...props,
      sender: {
        id: sender._id,
        fullname: sender.fullname,
      },
      sentAt: new Date(response.sentAt),
      updatedAt: new Date(response.updatedAt),
    });
  }
}
