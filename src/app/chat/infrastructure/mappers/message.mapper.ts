import { Message } from '../../domain';
import { MessageResponse } from '../interfaces/message.interface';

export class MessageMapper {
  static fromResponse(response: MessageResponse): Message {
    const { sender, createdAt, updatedAt, _id, ...props } = response;
    return new Message({
      id: response._id,
      ...props,
      sender: {
        id: sender._id,
        fullname: sender.fullname,
      },
      createdAt: new Date(response.createdAt),
      updatedAt: new Date(response.updatedAt),
    });
  }
}
