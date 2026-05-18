# README_DB_18g_18_05

> Snapshot tài liệu backend tại thời điểm khoảng **18:00 ngày 18/05**.  
> Phạm vi hiện tại: thiết kế DB MongoDB/Mongoose + Workspace + Workspace Invite URL + một phần model Channel/Message.

---

## 1. Tổng quan kiến trúc hiện tại

Backend đang dùng:

- **Node.js + Express + TypeScript**
- **MongoDB Atlas + Mongoose**
- **Socket.io** cho realtime/WebRTC signaling cơ bản
- Kiến trúc đang tách theo lớp:

```txt
Route -> Controller -> Service -> DAO -> Model -> MongoDB
```

Cấu trúc chính trong `src/`:

```txt
src/
├── controllers/
│   ├── Workspace.controller.ts
│   └── workspaceInvite.controller.ts
│
├── dao/
│   ├── BaseDAO.ts
│   ├── UserDAO.ts
│   ├── WorkspaceDAO.ts
│   └── WorkspaceInviteDAO.ts
│
├── dtos/
│   ├── Workspace.dto.ts
│   └── WorkspaceInvite.dto.ts
│
├── middlewares/
│   ├── auth.middleware.ts
│   └── validate.middleware.ts
│
├── models/
│   ├── AccessRequest.model.ts
│   ├── Channel.model.ts
│   ├── ChannelMember.model.ts
│   ├── Message.model.ts
│   ├── Workspace.model.ts
│   └── WorkspaceInvite.model.ts
│
├── routes/
│   ├── index.ts
│   ├── Workspace.route.ts
│   └── workspaceInvite.routes.ts
│
├── services/
│   ├── Workspace.service.ts
│   └── workspaceInvite.service.ts
│
├── utils/
│   ├── generateInviteCode.ts
│   └── slugify.ts
│
├── app.ts
└── server.ts
```

---

## 2. Server hiện tại

File chính đang chạy là:

```txt
src/server.ts
```

`server.ts` hiện làm các việc:

- Khởi tạo Express app
- Tạo HTTP server
- Gắn middleware:
  - `cors()`
  - `express.json()`
- Mount route version:

```ts
app.use('/api/v1', routes);
```

- Khởi tạo Socket.io
- Kết nối MongoDB bằng:

```ts
mongoose.connect(process.env.MONGODB_URI!)
```

- Health check cơ bản:

```http
GET /
```

Response:

```txt
Backend Server & Socket.io & MongoDB is Running! 🚀
```

---

## 3. Middleware hiện tại

### 3.1 `auth.middleware.ts`

Hiện tại đang là **fake auth middleware cho dev**.

```ts
(req as any).user = {
  id: '507f1f77bcf86cd799439011',
  plan: 'pro'
};
```

Tức là mọi request có gắn `auth` đều được xem như user này.

> Lưu ý: Khi module User/Auth thật hoàn thành, cần thay lại bằng JWT verify thật.

JWT middleware thật hiện đang bị comment trong file.

---

### 3.2 `validate.middleware.ts`

Middleware validate body bằng Zod:

```ts
validate(schema)
```

Hiện tại chỉ validate `req.body`, chưa validate `req.params` hoặc `req.query`.

Nếu body sai schema thì trả:

```http
422 Unprocessable Entity
```

Response:

```json
{
  "message": "Dữ liệu không hợp lệ",
  "errors": []
}
```

---

## 4. Models hiện tại

### 4.1 `Workspace.model.ts`

Dùng để lưu Group/Workspace.

Fields chính:

```ts
name: string;
slug: string;
description?: string;
ownerId: ObjectId<User>;
members: ObjectId<User>[];
plan: 'standard' | 'pro';
channelCount: number;
createdAt: Date;
updatedAt: Date;
```

Indexes:

```ts
workspaceSchema.index({ slug: 1 }, { unique: true });
workspaceSchema.index({ members: 1, updatedAt: -1 });
```

Ý nghĩa:

- `slug` unique toàn hệ thống.
- `members` dùng để lấy danh sách workspace của user hiện tại.
- `ownerId` hiện được xem như admin/owner workspace.
- `plan` dùng cho logic giới hạn channel sau này:
  - `standard`: tối đa 5 channel
  - `pro`: tối đa 20 channel

---

### 4.2 `WorkspaceInvite.model.ts`

Dùng để tạo mã/link mời vào workspace.

Fields chính:

```ts
workspaceId: ObjectId<Workspace>;
code: string;
createdBy: ObjectId<User>;
status: 'pending' | 'active' | 'rejected' | 'revoked' | 'expired';
maxUses?: number | null;
usedCount: number;
expiresAt?: Date | null;
reviewedBy?: ObjectId<User> | null;
reviewedAt?: Date | null;
rejectReason?: string;
createdAt: Date;
updatedAt: Date;
```

Indexes:

```ts
workspaceInviteSchema.index({ workspaceId: 1, status: 1 });
workspaceInviteSchema.index({ createdBy: 1, status: 1 });
workspaceInviteSchema.index({ code: 1 }, { unique: true });
```

Logic nghiệp vụ hiện tại:

- Member thường tạo invite → `status = pending`
- Owner/admin tạo invite → `status = active`
- Invite pending cần owner/admin duyệt.
- Invite active mới dùng để join workspace được.
- Có hỗ trợ:
  - giới hạn lượt dùng: `maxUses`
  - số lượt đã dùng: `usedCount`
  - hạn dùng: `expiresAt`

---

### 4.3 `Channel.model.ts`

Dùng để lưu channel trong workspace.

Fields chính:

```ts
workspaceId: ObjectId<Workspace>;
name: string;
description?: string;
slug: string;
type: 'private' | 'public';
createdBy: ObjectId<User>;
members: ObjectId<User>[];
createdAt: Date;
updatedAt: Date;
```

Index:

```ts
channelSchema.index({ workspaceId: 1, slug: 1 }, { unique: true });
```

Ý nghĩa:

- Trong cùng workspace không được có 2 channel trùng slug.
- Khác workspace có thể dùng cùng slug.

---

### 4.4 `Message.model.ts`

Dùng để lưu tin nhắn.

Fields chính:

```ts
workspaceId: ObjectId<Workspace>;
channelId: ObjectId<Channel>;
userId: ObjectId<User>;
content: string; // max 2000 chars
createdAt: Date;
updatedAt: Date;
```

Indexes:

```ts
messageSchema.index({ channelId: 1, createdAt: -1 });
messageSchema.index({ content: 'text' });
```

Ý nghĩa:

- `{ channelId: 1, createdAt: -1 }`: tối ưu lấy lịch sử chat theo channel, mới nhất trước.
- `{ content: 'text' }`: hỗ trợ text search.

---

### 4.5 `ChannelMember.model.ts`

Dùng để lưu trạng thái/thông tin thành viên trong channel.

Fields chính:

```ts
channelId: ObjectId<Channel>;
workspaceId: ObjectId<Workspace>;
userId: ObjectId<User>;
role: 'owner' | 'admin' | 'member';
status: 'active' | 'left' | 'banned';
joinedAt: Date;
leftAt?: Date | null;
createdAt: Date;
updatedAt: Date;
```

Indexes:

```ts
channelMemberSchema.index({ channelId: 1, userId: 1 }, { unique: true });
channelMemberSchema.index({ channelId: 1, status: 1 });
channelMemberSchema.index({ userId: 1, status: 1 });
```

Ý nghĩa:

- Hỗ trợ lưu lịch sử join/leave channel.
- Một user chỉ có một record membership trong một channel.

---

### 4.6 `AccessRequest.model.ts`

Dùng cho invite/request ở cấp **channel**.

Fields chính:

```ts
channelId: ObjectId<Channel>;
workspaceId: ObjectId<Workspace>;
senderId: ObjectId<User>;
recipientId?: ObjectId<User> | null;
type: 'invite' | 'request';
status: 'pending' | 'accepted' | 'rejected' | 'expired' | 'revoked';
message?: string;
createdAt: Date;
updatedAt: Date;
```

Indexes:

```ts
accessRequestSchema.index({ channelId: 1, status: 1 });
accessRequestSchema.index({ recipientId: 1, status: 1 });
accessRequestSchema.index({ senderId: 1, status: 1 });
```

Ghi chú:

- Model này hiện **chưa có controller/service/route**.
- Dự kiến dùng cho private channel:
  - user request vào channel
  - admin/owner invite user vào channel

---

## 5. DAO hiện tại

### 5.1 `BaseDAO.ts`

Base DAO generic:

```ts
create(doc)
findById(id)
findOne(filter)
updateById(id, update)
```

Hiện chưa có:

```ts
deleteById(id)
find(filter)
count(filter)
```

---

### 5.2 `WorkspaceDAO.ts`

Methods:

```ts
findBySlug(slug)
listByMember(userId, page, limit)
```

`listByMember` query workspace bằng:

```ts
{ members: userObjectId }
```

Có phân trang:

```ts
page
limit
skip
```

---

### 5.3 `WorkspaceInviteDAO.ts`

Methods:

```ts
findByCode(code)
listPendingByWorkspace(workspaceId)
incrementUsedCount(inviteId)
```

---

### 5.4 `UserDAO.ts`

Hiện đang là fake DAO:

```ts
{
  _id: id,
  name: 'Duy Binh',
  email: 'duybinh@uit.edu.vn',
  plan: 'pro'
}
```

User module thật do nhóm khác làm.

---

## 6. DTO hiện tại

### 6.1 `Workspace.dto.ts`

```ts
CreateWorkspaceDTO = {
  name: string; // min 2 max 100
  description?: string; // max 500
}
```

Slug không nhận từ client. Service tự sinh slug từ `name` bằng `slugify`.

---

### 6.2 `WorkspaceInvite.dto.ts`

```ts
CreateWorkspaceInviteDTO = {
  maxUses?: number; // int min 1
  expiresInHours?: number; // int min 1 max 720
}
```

```ts
ReviewWorkspaceInviteDTO = {
  status: 'active' | 'rejected';
  rejectReason?: string; // max 500
}
```

---

## 7. Services hiện tại

## 7.1 `Workspace.service.ts`

### `createWorkspace(payload)`

Input:

```ts
{
  name: string;
  description?: string;
  ownerId: string;
}
```

Logic:

1. Sinh slug từ `name` bằng `slugify`.
2. Nếu slug đã tồn tại → thêm hậu tố `-1`, `-2`, ...
3. Tạo workspace:

```ts
{
  name,
  slug,
  description,
  ownerId,
  members: [ownerId],
  plan: 'standard',
  channelCount: 0
}
```

Ghi chú:

- Logic lấy plan từ User hiện đang comment.
- Hiện mặc định workspace tạo ra là `standard`.

---

### `getMyWorkspaces(userId, page, limit)`

Trả về các workspace mà user hiện tại là member.

Response:

```json
{
  "data": [],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 0,
    "totalPages": 0
  }
}
```

---

### `deleteWorkspace(workspaceId, userId)`

Hiện tại phần logic xóa thật đang bị comment và hàm chỉ:

```ts
return true;
```

Ghi chú quan trọng:

- Route delete đã có nhưng service chưa xóa thật.
- Controller hiện lấy `workspaceId` từ query, không lấy từ params. Cần sửa sau.

---

## 7.2 `workspaceInvite.service.ts`

### `createWorkspaceInvite(payload)`

Input:

```ts
{
  workspaceId: string;
  createdBy: string;
  maxUses?: number;
  expiresInHours?: number;
}
```

Logic:

1. Tìm workspace.
2. Check `createdBy` có trong `workspace.members`.
3. Check `createdBy === workspace.ownerId` để xác định admin.
4. Sinh invite code bằng `generateInviteCode`.
5. Nếu code trùng → sinh lại.
6. Nếu `expiresInHours` có truyền → set `expiresAt`.
7. Tạo invite:
   - owner/admin tạo → `status = active`
   - member tạo → `status = pending`
8. Trả về invite + invite URL:

```ts
`${FRONTEND_URL}/join/workspace/${code}`
```

---

### `listPendingWorkspaceInvites(payload)`

Input:

```ts
{
  workspaceId: string;
  reviewerId: string;
}
```

Logic:

1. Tìm workspace.
2. Chỉ owner/admin được xem pending.
3. Trả danh sách invite có `status = pending` trong workspace.

---

### `reviewWorkspaceInvite(payload)`

Input:

```ts
{
  inviteId: string;
  reviewerId: string;
  status: 'active' | 'rejected';
  rejectReason?: string;
}
```

Logic:

1. Tìm invite.
2. Tìm workspace của invite.
3. Chỉ owner/admin workspace được duyệt.
4. Chỉ invite `pending` mới được duyệt.
5. Update:

```ts
status
reviewedBy
reviewedAt
rejectReason
```

---

### `getWorkspaceInviteByCode(code)`

Hiện tại:

1. Tìm invite bằng code.
2. Nếu không có → 404.
3. Trả về invite document.

Ghi chú:

- Hàm này hiện chưa populate/thêm thông tin workspace.
- Có thể nâng cấp sau để frontend hiển thị tên workspace khi mở link invite.

---

### `acceptWorkspaceInvite(payload)`

Input:

```ts
{
  code: string;
  userId: string;
}
```

Logic:

1. Tìm invite bằng code.
2. Nếu pending → 403.
3. Nếu không active → 400.
4. Check `expiresAt`.
5. Check `maxUses` / `usedCount`.
6. Tìm workspace.
7. Nếu user chưa phải member:
   - `$addToSet` user vào `workspace.members`
   - tăng `usedCount`
8. Nếu user đã là member → trả message đã là thành viên.

---

## 8. Routes hiện tại

`src/routes/index.ts`:

```ts
router.use('/workspaces', workspaceRoutes);
router.use('/', workspaceInviteRoutes);
```

Tất cả route được mount dưới:

```http
/api/v1
```

---

## 8.1 Workspace routes

File:

```txt
src/routes/Workspace.route.ts
```

### `GET /api/v1/workspaces/me`

Lấy danh sách workspace mà user hiện tại là member.

Query:

```txt
?page=1&limit=10
```

---

### `POST /api/v1/workspaces`

Tạo workspace mới.

Body:

```json
{
  "name": "UIT Team",
  "description": "Nhóm dự án SE104"
}
```

Service tự sinh slug.

---

### `DELETE /api/v1/workspaces/:workspaceId`

Đã khai báo route nhưng hiện controller/service chưa chuẩn:

- Route dùng params `:workspaceId`
- Controller lại lấy `req.query.workspaceId`
- Service chưa xóa thật, chỉ `return true`

Cần sửa sau.

---

## 8.2 Workspace invite routes

File:

```txt
src/routes/workspaceInvite.routes.ts
```

### `POST /api/v1/workspaces/:workspaceId/invites`

Tạo invite link cho workspace.

Body:

```json
{
  "maxUses": 5,
  "expiresInHours": 24
}
```

Logic:

- Owner tạo → active ngay.
- Member tạo → pending, chờ owner duyệt.

Response mẫu:

```json
{
  "invite": {
    "workspaceId": "...",
    "code": "7MixRVDgv8",
    "createdBy": "...",
    "status": "active",
    "maxUses": 5,
    "usedCount": 0,
    "expiresAt": "..."
  },
  "inviteUrl": "http://localhost:3000/join/workspace/7MixRVDgv8",
  "requiresApproval": false,
  "message": "Invite URL đã được kích hoạt"
}
```

---

### `GET /api/v1/workspaces/:workspaceId/invites/pending`

Mục tiêu: owner/admin xem invite đang chờ duyệt.

**Lưu ý hiện tại:** route đang khai báo là:

```ts
router.get('/:workspaceId/invites/pending', ...)
```

Vì `workspaceInviteRoutes` được mount tại `/api/v1`, endpoint thực tế hiện tại sẽ là:

```http
GET /api/v1/:workspaceId/invites/pending
```

Muốn đúng REST như tài liệu thì nên sửa thành:

```ts
router.get('/workspaces/:workspaceId/invites/pending', ...)
```

để endpoint là:

```http
GET /api/v1/workspaces/:workspaceId/invites/pending
```

---

### `GET /api/v1/workspace-invites/:code`

Lấy thông tin invite bằng code.

Ví dụ:

```http
GET /api/v1/workspace-invites/7MixRVDgv8
```

---

### `PATCH /api/v1/workspace-invites/:inviteId/review`

Owner/admin approve hoặc reject invite.

Approve body:

```json
{
  "status": "active"
}
```

Reject body:

```json
{
  "status": "rejected",
  "rejectReason": "Invite không hợp lệ"
}
```

---

### `POST /api/v1/workspace-invites/:code/accept`

Join workspace bằng invite code.

Ví dụ:

```http
POST /api/v1/workspace-invites/7MixRVDgv8/accept
```

---

## 9. Utils hiện tại

### 9.1 `slugify.ts`

Chuyển tên thành slug:

```ts
"Dự Án UIT" -> "du-an-uit"
```

Có xử lý:

- lowercase
- bỏ dấu tiếng Việt
- thay khoảng trắng bằng `-`
- xóa ký tự đặc biệt

---

### 9.2 `generateInviteCode.ts`

Sinh mã invite bằng `crypto.randomBytes`:

```ts
generateInviteCode(10)
```

Output ví dụ:

```txt
7MixRVDgv8
```

Dùng `base64url`, an toàn cho URL.

---

## 10. Test đã thực hiện

### 10.1 `GET /api/v1/workspaces/me`

Đã test thành công.

Response từng thấy:

```json
{
  "data": [
    {
      "_id": "6a0ad22231a1987351835a7d",
      "name": "UIT Team",
      "slug": "uit-team",
      "description": "Nhóm dự án SE104",
      "ownerId": "507f1f77bcf86cd799439011",
      "members": ["507f1f77bcf86cd799439011"],
      "plan": "standard",
      "channelCount": 0
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1
  }
}
```

---

### 10.2 Invite code đã tạo

Đã tạo được invite code:

```txt
7MixRVDgv8
```

Invite URL frontend:

```txt
http://localhost:5000/join/workspace/7MixRVDgv8
```

Lưu ý: service tạo URL từ `FRONTEND_URL`, mặc định `http://localhost:3000`. Nếu muốn frontend thật, set `.env`:

```env
FRONTEND_URL=http://localhost:3000
```

Backend API để đọc/accept invite vẫn là:

```http
GET  /api/v1/workspace-invites/7MixRVDgv8
POST /api/v1/workspace-invites/7MixRVDgv8/accept
```

---

## 11. Curl test hiện tại

### Set token dev

```bash
TOKEN="<your-token>"
```

Hiện middleware auth là fake nên token không thật sự được verify, nhưng header vẫn nên giữ để sau này không phải đổi workflow test.

---

### List workspace của user

```bash
curl -i "http://localhost:5000/api/v1/workspaces/me?page=1&limit=10" \
  -H "Authorization: Bearer $TOKEN"
```

---

### Tạo workspace

```bash
curl -i -X POST "http://localhost:5000/api/v1/workspaces" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "UIT Team",
    "description": "Nhóm dự án SE104"
  }'
```

---

### Tạo invite workspace

```bash
curl -i -X POST "http://localhost:5000/api/v1/workspaces/6a0ad22231a1987351835a7d/invites" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"maxUses": 5, "expiresInHours": 24}'
```

---

### Xem invite theo code

```bash
curl -i -X GET "http://localhost:5000/api/v1/workspace-invites/7MixRVDgv8" \
  -H "Authorization: Bearer $TOKEN"
```

---

### Accept invite

```bash
curl -i -X POST "http://localhost:5000/api/v1/workspace-invites/7MixRVDgv8/accept" \
  -H "Authorization: Bearer $TOKEN"
```

Nếu dùng chính owner token thì response có thể là:

```json
{
  "message": "Bạn đã là thành viên workspace này",
  "workspaceId": "..."
}
```

---

### Duyệt invite pending

```bash
curl -i -X PATCH "http://localhost:5000/api/v1/workspace-invites/<inviteId>/review" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"active"}'
```

---

## 12. Những điểm cần fix ngay sau snapshot này

### 12.1 Fix pending invite route

Hiện route pending invite nên sửa từ:

```ts
router.get('/:workspaceId/invites/pending', ...)
```

thành:

```ts
router.get('/workspaces/:workspaceId/invites/pending', ...)
```

để nhất quán với:

```http
GET /api/v1/workspaces/:workspaceId/invites/pending
```

---

### 12.2 Fix delete workspace

Hiện tại route là:

```ts
router.delete('/:workspaceId', auth, workspaceController.deleteWorkspace);
```

Nhưng controller lại lấy:

```ts
const raw = req.query.workspaceId;
```

Nên sửa thành:

```ts
const { workspaceId } = req.params;
```

Service delete hiện cũng chưa làm thật.

---

### 12.3 Auth middleware đang fake

Hiện `auth.middleware.ts` đang bypass JWT và gán hard-coded user.

Cần thay bằng verify JWT thật khi module User/Auth hoàn thành.

---

### 12.4 `getWorkspaceInviteByCode` nên trả kèm workspace info

Hiện chỉ trả invite document. Có thể nâng cấp để trả:

```json
{
  "invite": {},
  "workspace": {
    "_id": "...",
    "name": "...",
    "slug": "...",
    "description": "..."
  }
}
```

Frontend mở link mời sẽ cần hiển thị tên workspace.

---

### 12.5 BaseDAO thiếu delete

`BaseDAO` hiện chưa có:

```ts
deleteById(id)
```

Cần thêm để implement delete workspace/channel/invite revoke.

---

## 13. Những phần chưa triển khai route/service

Đã có model nhưng chưa có API hoàn chỉnh:

### Channel

Đã có model nhưng chưa có:

- `POST /api/v1/workspaces/:workspaceId/channels`
- `GET /api/v1/workspaces/:workspaceId/channels`
- `GET /api/v1/channels/:channelId`
- `PATCH /api/v1/channels/:channelId`
- `DELETE /api/v1/channels/:channelId`

Cần check limit theo workspace plan:

- `standard`: max 5 channels
- `pro`: max 20 channels

---

### Message

Đã có model nhưng chưa có:

- `GET /api/v1/channels/:channelId/messages`
- `POST /api/v1/channels/:channelId/messages`
- `PATCH /api/v1/messages/:messageId`
- `DELETE /api/v1/messages/:messageId`

---

### AccessRequest

Đã có model nhưng chưa có:

- request vào private channel
- invite user vào private channel
- accept/reject channel access request

---

## 14. Kết luận snapshot

Tại thời điểm hiện tại, backend đã có nền tảng chính cho:

- Workspace model
- Workspace creation
- List workspace theo current user
- Workspace invite URL model
- Tạo invite URL
- Duyệt/reject invite
- Accept invite để join workspace
- Các model phục vụ channel/message/channel membership/access request

Phần workspace invite đã đủ để bắt đầu test end-to-end:

```txt
create workspace -> list my workspaces -> create invite -> get invite by code -> accept invite
```

Các phần cần ưu tiên tiếp theo:

1. Fix delete workspace.
2. Fix pending invite route path.
3. Nâng cấp `getWorkspaceInviteByCode` trả kèm workspace info.
4. Bắt đầu triển khai Channel CRUD + check limit 5/20.
5. Triển khai Message API.
6. Triển khai AccessRequest cho private channel.
