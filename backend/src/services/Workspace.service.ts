import { WorkspaceDAO } from '../dao/WorkspaceDAO';
// import { UserDAO } from '../dao/UserDAO'; // Mày cần tạo thêm UserDAO
import { Types } from 'mongoose';
import { slugify } from '../utils/slugify';

const workspaceDAO = new WorkspaceDAO();
// const userDAO = new UserDAO(); // Inject UserDAO để lấy thông tin user

export const getMyWorkspaces = async (userId: string, page = 1, limit = 10) => {
  const { items, total } = await workspaceDAO.listByMember(userId, page, limit);

  return {
    data: items,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};

export const deleteWorkspace = async (workspaceId: string, userId: string) => {
  // // 1. Tìm workspace để lấy ownerId
  // const workspace = await workspaceDAO.findById(workspaceId);
  
  // if (!workspace) {
  //   throw Object.assign(new Error('Workspace không tồn tại'), { status: 404 });
  // }

  // 2. Kiểm tra quyền (Admin/Owner)
  // workspace.ownerId trả về kiểu Types.ObjectId nên cần so sánh toString()
  // if (workspace.ownerId.toString() !== userId) {
  //   throw Object.assign(new Error('Bạn không có quyền xóa workspace này'), { status: 403 });
  // }

  // 3. Xóa Workspace
  // await workspaceDAO.deleteById(workspaceId);
  
  // 4. (Tuỳ chọn) Ở đây mày có thể trigger xóa cascade các Channel, 
  // await channelDAO.model.deleteMany({ workspaceId });
  // await messageDAO.model.deleteMany({ workspaceId });
  // await channelMemberDAO.model.deleteMany({ workspaceId });
  return true;
};

export const createWorkspace = async (payload: {
  name: string;
  description?: string;
  ownerId: string;
}) => {
  // 1. Lấy thông tin User tạo để xem họ dùng gói gì
  // const user = await userDAO.findById(payload.ownerId);
  // if (!user) {
  //   throw Object.assign(new Error('Người dùng không tồn tại'), { status: 404 });
  // }

  // const userPlan = user.plan; // 'standard' hoặc 'pro'

  // 2. Xử lý Slug (Tự động tạo và xử lý trùng)
  let slug = slugify(payload.name);
  let existing = await workspaceDAO.findBySlug(slug);
  let originalSlug = slug;
  let counter = 1;

  while (existing) {
    slug = `${originalSlug}-${counter++}`;
    // CẬP NHẬT: Gán lại vào biến existing (không dùng const ở đây)
    existing = await workspaceDAO.findBySlug(slug);
  }

  // 3. Thực hiện tạo Workspace với plan của User
  const ownerObjectId = new Types.ObjectId(payload.ownerId);

  const workspace = await workspaceDAO.create({
    name: payload.name,
    slug: slug,
    description: payload.description || '',
    ownerId: ownerObjectId,
    members: [{ userId: ownerObjectId, role: 'owner', joinedAt: new Date() }],
    plan: 'standard', // Mặc định là standard, sau này có thể nâng cấp dựa trên userPlan
    channelCount: 0
  });

  await import('../models/User.model').then(({ default: User }) =>
    User.findByIdAndUpdate(payload.ownerId, {
      $addToSet: {
        workspaces: {
          workspaceId: workspace._id,
          role: 'owner'
        }
      }
    })
  );

  return workspace;
};

