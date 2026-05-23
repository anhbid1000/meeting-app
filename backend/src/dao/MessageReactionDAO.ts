import { Types } from "mongoose";
import MessageReaction, {
  type IMessageReaction,
} from "../models/MessageReaction.model";

export class MessageReactionDAO {
  async addReaction(params: {
    messageId: string;
    channelId: string;
    workspaceId: string;
    userId: string;
    emoji: string;
  }) {
    const { messageId, channelId, workspaceId, userId, emoji } = params;

    return MessageReaction.findOneAndUpdate(
      {
        messageId: new Types.ObjectId(messageId),
        userId: new Types.ObjectId(userId),
        emoji,
      },
      {
        $setOnInsert: {
          channelId: new Types.ObjectId(channelId),
          workspaceId: new Types.ObjectId(workspaceId),
        },
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      },
    ).lean<IMessageReaction>();
  }

  async removeReaction(params: {
    messageId: string;
    userId: string;
    emoji: string;
  }) {
    const { messageId, userId, emoji } = params;

    return MessageReaction.findOneAndDelete({
      messageId: new Types.ObjectId(messageId),
      userId: new Types.ObjectId(userId),
      emoji,
    }).lean<IMessageReaction>();
  }
}

export const messageReactionDAO = new MessageReactionDAO();
