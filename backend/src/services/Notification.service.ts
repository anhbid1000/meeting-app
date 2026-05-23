import { Types } from "mongoose";
import Notification, { NotificationType } from "../models/Notification.model";
import { realtimeBus } from "../utils/realtime";

type CreateNotificationInput = {
  userId: string;
  workspaceId: string;
  type: NotificationType;
  title: string;
  description?: string;
  relatedUserId?: string;
  relatedChannelId?: string;
  relatedMessageId?: string;
  relatedRequestId?: string;
};

export class NotificationService {
  static async createNotification(input: CreateNotificationInput) {
    const notification = await Notification.create({
      userId: new Types.ObjectId(input.userId),
      workspaceId: new Types.ObjectId(input.workspaceId),
      type: input.type,
      title: input.title,
      description: input.description || "",
      relatedUserId: input.relatedUserId
        ? new Types.ObjectId(input.relatedUserId)
        : undefined,
      relatedChannelId: input.relatedChannelId
        ? new Types.ObjectId(input.relatedChannelId)
        : undefined,
      relatedMessageId: input.relatedMessageId
        ? new Types.ObjectId(input.relatedMessageId)
        : undefined,
      relatedRequestId: input.relatedRequestId
        ? new Types.ObjectId(input.relatedRequestId)
        : undefined,
      isRead: false,
    } as any);

    const detailed = notification.toObject();
    realtimeBus.emitEvent("notification:new", detailed);
    return detailed;
  }

  static async createManyNotifications(inputs: CreateNotificationInput[]) {
    if (!inputs.length) return [];

    const docs = await Notification.insertMany(
      inputs.map(
        (input) =>
          ({
            userId: new Types.ObjectId(input.userId),
            workspaceId: new Types.ObjectId(input.workspaceId),
            type: input.type,
            title: input.title,
            description: input.description || "",
            relatedUserId: input.relatedUserId
              ? new Types.ObjectId(input.relatedUserId)
              : undefined,
            relatedChannelId: input.relatedChannelId
              ? new Types.ObjectId(input.relatedChannelId)
              : undefined,
            relatedMessageId: input.relatedMessageId
              ? new Types.ObjectId(input.relatedMessageId)
              : undefined,
            relatedRequestId: input.relatedRequestId
              ? new Types.ObjectId(input.relatedRequestId)
              : undefined,
            isRead: false,
          }) as any,
      ),
    );

    const plainDocs = docs.map((doc) => doc.toObject());
    plainDocs.forEach((doc) => realtimeBus.emitEvent("notification:new", doc));
    return plainDocs;
  }

  static async getNotifications(params: {
    userId: string;
    page?: number;
    limit?: number;
    unreadOnly?: boolean;
  }) {
    const { userId, page = 1, limit = 20, unreadOnly = false } = params;
    const filter: Record<string, any> = { userId };

    if (unreadOnly) {
      filter.isRead = false;
    }

    const skip = (page - 1) * limit;

    const [items, total, unreadCount] = await Promise.all([
      Notification.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Notification.countDocuments(filter),
      Notification.countDocuments({ userId, isRead: false }),
    ]);

    return {
      success: true,
      data: items,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        unreadCount,
      },
    };
  }

  static async getUnreadCount(userId: string) {
    const count = await Notification.countDocuments({ userId, isRead: false });
    return {
      success: true,
      data: { unreadCount: count },
    };
  }

  static async markAsRead(notificationId: string, userId: string) {
    const updated = await Notification.findOneAndUpdate(
      { _id: notificationId, userId },
      { $set: { isRead: true, readAt: new Date() } },
      { new: true },
    ).lean();

    if (!updated) {
      throw Object.assign(new Error("Notification not found"), { status: 404 });
    }

    realtimeBus.emitEvent("notification:update", updated);
    return { success: true, data: updated };
  }

  static async markAllAsRead(userId: string) {
    await Notification.updateMany(
      { userId, isRead: false },
      { $set: { isRead: true, readAt: new Date() } },
    ).lean();

    realtimeBus.emitEvent("notification:update", {
      userId,
      readAll: true,
    });

    return { success: true };
  }

  static async deleteNotification(notificationId: string, userId: string) {
    const deleted = await Notification.findOneAndDelete({
      _id: notificationId,
      userId,
    }).lean();

    if (!deleted) {
      throw Object.assign(new Error("Notification not found"), { status: 404 });
    }

    realtimeBus.emitEvent("notification:delete", deleted);
    return { success: true, data: deleted };
  }
}
