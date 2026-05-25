import Workspace, { IWorkspace } from '../models/Workspace.model';
import { BaseDAO } from './BaseDAO';
import { Types } from 'mongoose';

export class WorkspaceDAO extends BaseDAO<IWorkspace> {
  constructor() {
    super(Workspace);
  }

  async find(userId: string) {
    try {
      return await Workspace.find({
        'members.userId': new Types.ObjectId(userId)
      })
        .select('_id')
        .lean();
    } catch (error) {
      console.error(`DAO Find Error: ${error}`);
      throw error;
    }
  };
  async findBySlug(slug: string) {
    return this.model.findOne({ slug }).lean();
  }

  async deleteWorkspaceById(workspaceId: string, userId: string) {
    const workspace = await this.model.findById(workspaceId).lean();
    if (!workspace) {
      throw Object.assign(new Error('Workspace không tồn tại'), { status: 404 });
    }
    if (workspace.ownerId.toString() !== userId) {
      throw Object.assign(new Error('Bạn không có quyền xóa workspace này'), { status: 403 });
    }
    await this.model.deleteOne({ _id: workspaceId });
    return true;
  }

  async listByMember(userId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const uid = new Types.ObjectId(userId);

    const membershipFilter = {
      members: {
        $elemMatch: {
          userId: uid,
          role: { $ne: 'pending' }
        }
      }
    };

    const [items, total] = await Promise.all([
      this.model.aggregate([
        { $match: membershipFilter },
        { $sort: { updatedAt: -1 } },
        { $skip: skip },
        { $limit: limit },
        {
          $addFields: {
            memberCount: {
              $size: {
                $filter: {
                  input: "$members",
                  as: "member",
                  cond: { $ne: ["$$member.role", "pending"] }
                }
              }
            }
          }
        },
        {
          $project: {
            name: 1,
            slug: 1,
            description: 1,
            category: 1,
            plan: 1,
            memberCount: 1,
            updatedAt: 1
          }
        },
        {
          $lookup: {
            from: "categories",
            localField: "category",
            foreignField: "_id",
            as: "category"
          }
        },
        {
          $unwind: {
            path: "$category",
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $project: {
            "category.createdAt": 0,
            "category.updatedAt": 0,
            "category.__v": 0
          }
        }
      ]),
      this.model.countDocuments(membershipFilter)
    ]);

    return { items, total };
  }
}