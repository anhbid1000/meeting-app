# Module 3 - Checklist Triển Khai Chi Tiết & Tuần Tự

**File này là Execution Plan chi tiết, dựa trên các yêu cầu từ Mô tả Module 3 gốc và file Kế hoạch Kỹ thuật.**

---

## PHASE 1: Chuẩn hóa Domain Model & Permission System

### PHASE 1.1: Chuẩn hóa & mở rộng Database Models

#### Task 1.1.1 - Bổ sung Channel.model.ts

- [ ] Thêm field `isArchived: boolean` (default: false)
- [ ] Thêm field `category?: string` (để nhóm channel)
- [ ] Thêm field `lastMessageAt?: Date`
- [ ] Thêm field `memberCount: number` (cache hoặc tính lúc query)
- [ ] Verify index `{ workspaceId: 1, slug: 1 }` và `{ workspaceId: 1, type: 1 }`
- [ ] Thêm index cho `lastMessageAt` để sort channels
- [ ] **Lý thuyết:** Channel cần metadata để hỗ trợ sorting, filtering, activity preview. Không nên tính toán runtime mà nên lưu sẵn.

#### Task 1.1.2 - Tạo ChannelMember.model.ts (model riêng)

- [ ] Tạo file `backend/src/models/ChannelMember.model.ts`
- [ ] Fields:
  - `channelId: ObjectId` (ref Channel)
  - `userId: ObjectId` (ref User)
  - `workspaceId: ObjectId` (ref Workspace, để query nhanh)
  - `role: enum['owner', 'admin', 'member']` (default: member)
  - `joinedAt: Date`
  - `lastReadAt?: Date` (để tính unread)
  - `isMuted: boolean` (default: false)
  - `isFavorite: boolean` (default: false)
  - `createdAt`, `updatedAt`
- [ ] Indexes:
  - `{ channelId: 1, userId: 1 }` unique
  - `{ userId: 1, workspaceId: 1 }` (để lấy channels của user)
  - `{ channelId: 1, role: 1 }` (để lấy owner/admin)
- [ ] **Lý thuyết:** Mô hình many-to-many với attributes. Giúp mở rộng role, metadata membership sau.

#### Task 1.1.3 - Mở rộng Message.model.ts

- [ ] Thêm field `type: enum['text', 'file', 'system', 'meeting']` (default: text)
- [ ] Thêm field `attachments?: [{ url, name, mimeType, size }]`
- [ ] Thêm field `threadCount: number` (default: 0)
- [ ] Thêm field `isEdited: boolean` (default: false)
- [ ] Thêm field `editedAt?: Date`
- [ ] Thêm field `isDeleted: boolean` (default: false)
- [ ] Thêm field `deletedAt?: Date`
- [ ] Thêm field `mentions?: [ObjectId]` (user IDs được mention)
- [ ] Thêm field `isPinned: boolean` (default: false)
- [ ] Verify indexes `{ channelId: 1, createdAt: -1 }` và `{ content: 'text' }`
- [ ] **Lý thuyết:** Message polymorphism - chứa nhiều loại nội dung, không chỉ plain text.

#### Task 1.1.4 - Tạo ThreadReply.model.ts (nếu tách riêng)

- [ ] Tạo file `backend/src/models/ThreadReply.model.ts`
- [ ] Fields:
  - `parentMessageId: ObjectId` (ref Message)
  - `channelId: ObjectId` (ref Channel)
  - `workspaceId: ObjectId`
  - `userId: ObjectId`
  - `content: string`
  - `attachments?: [...]`
  - `isEdited, editedAt, isDeleted, deletedAt`
  - `createdAt`, `updatedAt`
- [ ] Index: `{ parentMessageId: 1, createdAt: -1 }`
- [ ] **Lý thuyết:** Tách collection thread giúp query replies không cần filter message collection.

#### Task 1.1.5 - Tạo MessageReaction.model.ts

- [ ] Tạo file `backend/src/models/MessageReaction.model.ts`
- [ ] Fields:
  - `messageId: ObjectId` (ref Message)
  - `channelId: ObjectId`
  - `workspaceId: ObjectId`
  - `userId: ObjectId`
  - `emoji: string`
  - `createdAt: Date`
- [ ] Index: `{ messageId: 1, emoji: 1 }` (để aggregate reactions) và `{ messageId: 1, userId: 1 }` unique (1 user 1 emoji mỗi message)
- [ ] **Lý thuyết:** Reaction là metadata nhẹ, query phải nhanh => tách collection.

#### Task 1.1.6 - Tạo FileAsset.model.ts

- [ ] Tạo file `backend/src/models/FileAsset.model.ts`
- [ ] Fields:
  - `cloudinaryUrl: string`
  - `cloudinaryPublicId: string`
  - `fileName: string`
  - `mimeType: string`
  - `size: number`
  - `uploadedBy: ObjectId` (ref User)
  - `channelId: ObjectId` (ref Channel)
  - `workspaceId: ObjectId`
  - `messageId?: ObjectId` (nếu attach vào message)
  - `createdAt: Date`
- [ ] Index: `{ channelId: 1, createdAt: -1 }`
- [ ] **Lý thuyết:** Metadata file tách riêng, link đến message khi cần.

#### Task 1.1.7 - Tạo ChannelJoinRequest.model.ts (hoặc đổi tên AccessRequest)

- [ ] Đổi tên model từ `AccessRequest` thành `ChannelJoinRequest` (rõ hơn)
- [ ] Verify fields đã có:
  - `channelId`
  - `workspaceId`
  - `senderId`
  - `recipientId` (có thể null)
  - `type: enum['invite', 'request']`
  - `status: enum['pending', 'accepted', 'rejected']`
  - `message`
  - `createdAt`, `updatedAt`
- [ ] Indexes: `{ channelId: 1, status: 1 }`, `{ recipientId: 1, status: 1 }`, `{ senderId: 1, status: 1 }`
- [ ] **Lý thuyết:** Request state machine đơn giản - pending -> accepted/rejected.

#### Task 1.1.8 - Tạo Notification.model.ts

- [ ] Tạo file `backend/src/models/Notification.model.ts`
- [ ] Fields:
  - `userId: ObjectId` (người nhận)
  - `workspaceId: ObjectId`
  - `type: enum['join_request', 'request_approved', 'message', 'mention', 'thread_reply', 'meeting_start']`
  - `relatedUserId?: ObjectId`
  - `relatedChannelId?: ObjectId`
  - `relatedMessageId?: ObjectId`
  - `relatedRequestId?: ObjectId`
  - `title: string`
  - `description?: string`
  - `isRead: boolean` (default: false)
  - `readAt?: Date`
  - `createdAt: Date`
- [ ] Index: `{ userId: 1, isRead: 1, createdAt: -1 }`

#### Task 1.1.9 - Tạo Meeting.model.ts

- [ ] Tạo file `backend/src/models/Meeting.model.ts`
- [ ] Fields:
  - `channelId: ObjectId`
  - `workspaceId: ObjectId`
  - `createdBy: ObjectId`
  - `title: string`
  - `status: enum['scheduled', 'live', 'ended']`
  - `startedAt?: Date`
  - `endedAt?: Date`
  - `participants: [ObjectId]` (user IDs tham gia)
  - `createdAt: Date`
  - `updatedAt: Date`
- [ ] **Lý thuyết:** Meeting là event trong channel, track trạng thái và participants.

---

### PHASE 1.2: Permission & Auth Middleware

#### Task 1.2.1 - Thay thế fake auth middleware bằng JWT middleware thật (tạm)

- [ ] File: `backend/src/middlewares/auth.middleware.ts`
- [ ] Hàm `requireAuth`:
  - Check `Authorization: Bearer <token>`
  - Verify JWT (có sẵn trong project, chỉ cần uncomment)
  - Lưu `req.user` với `{ id, email, plan }`
  - Return 401 nếu token invalid
- [ ] Export middleware để dùng trong routes
- [ ] **Lý thuyết:** Middleware JWT decode token, không cần re-verify mỗi service.

#### Task 1.2.2 - Tạo workspace permission middleware

- [ ] File: `backend/src/middlewares/permission.middleware.ts`
- [ ] Hàm `requireWorkspaceMember`:
  - Extract `workspaceId` từ params
  - Query `WorkspaceMember` với `userId` và `workspaceId`
  - Return 403 nếu không là member
  - Lưu `req.workspaceMember` để dùng sau
- [ ] Hàm `requireWorkspaceRole(...roles)`:
  - Extract `workspaceId` từ params
  - Query role từ `WorkspaceMember`
  - Check role có trong list được phép
  - Return 403 nếu không được phép
- [ ] **Lý thuyết:** Middleware RBAC check role trước khi vào controller.

#### Task 1.2.3 - Tạo channel permission middleware

- [ ] File: `backend/src/middlewares/permission.middleware.ts` (append)
- [ ] Hàm `requireChannelMember`:
  - Extract `channelId` từ params
  - Query `ChannelMember` với `userId` và `channelId`
  - Return 403 nếu không là member
  - Lưu `req.channelMember` vào request
- [ ] **Lý thuyết:** Channel membership check trước khi send message / edit channel.

#### Task 1.2.4 - Tạo permission service (business logic)

- [ ] File: `backend/src/services/PermissionService.ts`
- [ ] Hàm static `canJoinChannel(userId, channelId, channelType)`:
  - Nếu public -> true
  - Nếu private -> check user có request pending/approved không
- [ ] Hàm static `canModifyChannel(userId, channelId)`:
  - Check user là owner hoặc admin của channel
- [ ] Hàm static `canApproveRequest(userId, channelId)`:
  - Check user là owner/admin của workspace chứa channel
- [ ] Hàm static `canSendMessage(userId, channelId)`:
  - Check user là member của channel
- [ ] **Lý thuyết:** Service chứa business logic quyền, controller gọi service chứ không check trực tiếp trong middleware.

---

## PHASE 2: Channel Directory Backend & API

### PHASE 2.1: Channel DAO/Service

#### Task 2.1.1 - Tạo ChannelDAO

- [ ] File: `backend/src/dao/ChannelDAO.ts` (extends BaseDAO)
- [ ] Hàm `findByWorkspace(workspaceId, options?)`:
  - Query channels của workspace
  - Support filter theo type, archived, category
  - Support pagination
  - Return với member count / lastMessageAt
- [ ] Hàm `findById(channelId)`
- [ ] Hàm `findBySlug(workspaceId, slug)`
- [ ] Hàm `create(channelData)`
- [ ] Hàm `update(channelId, updateData)`
- [ ] Hàm `delete(channelId)`
- [ ] Hàm `archive(channelId)`
- [ ] **Lý thuyết:** DAO là data access layer, bao gủm query logic phức tạp.

#### Task 2.1.2 - Tạo ChannelService

- [ ] File: `backend/src/services/ChannelService.ts`
- [ ] Hàm `getChannelDirectory(workspaceId, { search?, type?, category?, page?, limit? })`:
  - Gọi DAO query
  - Populate member count, last message
  - Group theo category nếu cần
  - Return paginated list
- [ ] Hàm `createChannel(workspaceId, userId, { name, description, type })`
  - Validate `name` không trống
  - Tạo `slug` từ name
  - Check user có quyền tạo channel
  - Lưu Channel
  - Tạo ChannelMember với user là owner
  - Return channel
- [ ] Hàm `updateChannel(channelId, userId, updateData)`
  - Check user là owner/admin
  - Update Channel
- [ ] Hàm `deleteChannel(channelId, userId)`
  - Check user là owner
  - Xóa Channel, ChannelMember, Message, JoinRequest liên quan
- [ ] Hàm `archiveChannel(channelId, userId)`
  - Check user là owner
  - Set `isArchived = true`
- [ ] **Lý thuyết:** Service chứa business logic, DAO gọi để query. Tách rõ logic từ DB access.

#### Task 2.1.3 - Tạo ChannelMemberService

- [ ] File: `backend/src/services/ChannelMemberService.ts`
- [ ] Hàm `addMember(channelId, userId, role = 'member')`
  - Check xem user đã là member chưa
  - Tạo ChannelMember
  - Emit socket event `channel:member:added`
- [ ] Hàm `removeMember(channelId, userId)`
  - Xóa ChannelMember
  - Emit socket event `channel:member:removed`
- [ ] Hàm `updateMemberRole(channelId, userId, role)`
  - Check user là owner
  - Update role
- [ ] Hàm `muteChannel(channelId, userId, isMuted)`
  - Update `isMuted` trong ChannelMember
- [ ] Hàm `favoriteChannel(channelId, userId, isFavorite)`
  - Update `isFavorite` trong ChannelMember
- [ ] Hàm `getChannelMembers(channelId, { page?, limit? })`
  - Query ChannelMember
  - Populate user data
  - Return paginated list

---

### PHASE 2.2: Channel Controller

#### Task 2.2.1 - Tạo ChannelController

- [ ] File: `backend/src/controllers/ChannelController.ts`
- [ ] Hàm `getChannelDirectory(req, res)`:
  - Extract query: search, type, category, page, limit
  - Gọi ChannelService.getChannelDirectory()
  - Return 200 + list
- [ ] Hàm `getChannel(req, res)`:
  - Extract `channelId` từ params
  - Query channel + members
  - Return 200 + channel info
- [ ] Hàm `createChannel(req, res)`:
  - Validate req.body (name, type, description)
  - Gọi ChannelService.createChannel()
  - Return 201 + channel
- [ ] Hàm `updateChannel(req, res)`:
  - Gọi ChannelService.updateChannel()
  - Return 200 + channel
- [ ] Hàm `deleteChannel(req, res)`:
  - Gọi ChannelService.deleteChannel()
  - Return 204
- [ ] Hàm `archiveChannel(req, res)`:
  - Gọi ChannelService.archiveChannel()
  - Return 200

#### Task 2.2.2 - Tạo ChannelMemberController

- [ ] File: `backend/src/controllers/ChannelMemberController.ts`
- [ ] Hàm `joinChannel(req, res)`:
  - Extract `channelId`
  - Check channel type = public
  - Gọi ChannelMemberService.addMember()
  - Return 200
- [ ] Hàm `leaveChannel(req, res)`:
  - Extract `channelId`
  - Check user không phải owner
  - Gọi ChannelMemberService.removeMember()
  - Return 204
- [ ] Hàm `getChannelMembers(req, res)`:
  - Gọi ChannelMemberService.getChannelMembers()
  - Return 200 + list
- [ ] Hàm `muteChannel(req, res)`:
  - Extract `channelId`, `isMuted` từ body
  - Gọi ChannelMemberService.muteChannel()
  - Return 200
- [ ] Hàm `favoriteChannel(req, res)`:
  - Gọi ChannelMemberService.favoriteChannel()
  - Return 200

---

### PHASE 2.3: Channel Routes

#### Task 2.3.1 - Tạo Channel routes

- [ ] File: `backend/src/routes/channel.routes.ts`
- [ ] Routes:
  - `GET /workspaces/:workspaceId/channels` -> ChannelController.getChannelDirectory
  - `GET /workspaces/:workspaceId/channels/:channelId` -> ChannelController.getChannel
  - `POST /workspaces/:workspaceId/channels` -> ChannelController.createChannel
  - `PATCH /workspaces/:workspaceId/channels/:channelId` -> ChannelController.updateChannel
  - `DELETE /workspaces/:workspaceId/channels/:channelId` -> ChannelController.deleteChannel
  - `PATCH /workspaces/:workspaceId/channels/:channelId/archive` -> ChannelController.archiveChannel
- [ ] Middlewares:
  - `requireAuth`
  - `requireWorkspaceMember`
- [ ] Validate body với Zod

#### Task 2.3.2 - Tạo ChannelMember routes

- [ ] File: `backend/src/routes/channelMember.routes.ts`
- [ ] Routes:
  - `POST /channels/:channelId/join` -> ChannelMemberController.joinChannel
  - `POST /channels/:channelId/leave` -> ChannelMemberController.leaveChannel
  - `GET /channels/:channelId/members` -> ChannelMemberController.getChannelMembers
  - `PATCH /channels/:channelId/mute` -> ChannelMemberController.muteChannel
  - `PATCH /channels/:channelId/favorite` -> ChannelMemberController.favoriteChannel
- [ ] Middlewares: `requireAuth`, `requireChannelMember` (nếu cần)

#### Task 2.3.3 - Đăng ký routes vào server

- [ ] File: `backend/src/server.ts`
- [ ] Import và mount:
  ```ts
  app.use("/api/v1/channels", channelRoutes);
  app.use("/api/v1/channel-members", channelMemberRoutes);
  ```

---

## PHASE 3: Private Channel Request System Backend

### PHASE 3.1: ChannelJoinRequest DAO/Service

#### Task 3.1.1 - Tạo ChannelJoinRequestDAO

- [ ] File: `backend/src/dao/ChannelJoinRequestDAO.ts`
- [ ] Hàm `findByChannel(channelId, { status?, page?, limit? })`
  - Query requests theo channel
  - Filter theo status nếu có
  - Return paginated
- [ ] Hàm `findPendingForUser(userId)`
  - Query request mà user nhận được
- [ ] Hàm `findByChannelAndUser(channelId, userId)`
  - Check xem user đã request/được invite chưa
- [ ] Hàm `create(requestData)`
- [ ] Hàm `updateStatus(requestId, newStatus)`

#### Task 3.1.2 - Tạo ChannelJoinRequestService

- [ ] File: `backend/src/services/ChannelJoinRequestService.ts`
- [ ] Hàm `createRequest(channelId, userId, message?)`:
  - Check channel là private
  - Check user chưa là member
  - Check request pending chưa có
  - Tạo request trạng thái pending
  - Emit socket event `join_request:new`
  - Send notification cho owner/admin
  - Return request
- [ ] Hàm `approveRequest(requestId, userId)`:
  - Check user là owner/admin của workspace
  - Get request
  - Thêm user vào channel (ChannelMemberService.addMember)
  - Update request -> `accepted`
  - Emit socket event `join_request:approved`
  - Send notification cho user
  - Return request
- [ ] Hàm `rejectRequest(requestId, userId)`:
  - Check permission
  - Update request -> `rejected`
  - Emit socket event `join_request:rejected`
  - Send notification
- [ ] Hàm `getPendingRequests(channelId)`
  - Query requests với status = pending
  - Populate sender, recipient
  - Return list

#### Task 3.1.3 - Tạo ChannelJoinRequestController

- [ ] File: `backend/src/controllers/ChannelJoinRequestController.ts`
- [ ] Hàm `createRequest(req, res)`
- [ ] Hàm `approveRequest(req, res)`
- [ ] Hàm `rejectRequest(req, res)`
- [ ] Hàm `getPendingRequests(req, res)`

#### Task 3.1.4 - Tạo ChannelJoinRequest routes

- [ ] File: `backend/src/routes/channelJoinRequest.routes.ts`
- [ ] Routes:
  - `POST /channels/:channelId/requests` -> createRequest
  - `GET /channels/:channelId/requests?status=pending` -> getPendingRequests
  - `PATCH /channels/:channelId/requests/:requestId/approve` -> approveRequest
  - `PATCH /channels/:channelId/requests/:requestId/reject` -> rejectRequest

---

## PHASE 4: Message Backend & API

### PHASE 4.1: Message DAO/Service

#### Task 4.1.1 - Tạo MessageDAO

- [ ] File: `backend/src/dao/MessageDAO.ts`
- [ ] Hàm `findByChannel(channelId, { limit, before?, after? })`:
  - Query paginated (cursor-based hoặc timestamp)
  - Sort createdAt descending
  - Populate userId
- [ ] Hàm `findById(messageId)`
  - Populate userId, reactions, thread count
- [ ] Hàm `create(messageData)`
  - Increment threadCount = 0 nếu không có parentMessageId
- [ ] Hàm `update(messageId, updateData)`
  - Mark isEdited = true, set editedAt
- [ ] Hàm `delete(messageId)`
  - Mark isDeleted = true, set deletedAt
  - Optionally clear content (để không phá layout chat)
- [ ] Hàm `incrementThreadCount(messageId)`
  - Tăng threadCount của message gốc

#### Task 4.1.2 - Tạo MessageService

- [ ] File: `backend/src/services/MessageService.ts`
- [ ] Hàm `sendMessage(channelId, userId, { content, attachments?, mentions?, type? })`:
  - Check user là member của channel
  - Validate content không trống
  - Tạo Message
  - If có mentions -> tạo notification cho mentioned users
  - Emit socket event `message:new`
  - Return message
- [ ] Hàm `getMessages(channelId, { limit, before?, after? })`:
  - Gọi DAO query
  - Populate reactions
  - Return paginated messages
- [ ] Hàm `editMessage(messageId, userId, { content })`:
  - Check user là người gửi
  - Update message
  - Emit socket event `message:update`
  - Return message
- [ ] Hàm `deleteMessage(messageId, userId)`:
  - Check user là người gửi hoặc admin
  - Mark deleted
  - Emit socket event `message:delete`
- [ ] Hàm `pinMessage(messageId, userId, channelId)`:
  - Check user là admin/owner
  - Set isPinned = true
  - Emit socket event
- [ ] Hàm `unpinMessage(messageId, userId)`:
  - Set isPinned = false

#### Task 4.1.3 - Tạo MessageController

- [ ] File: `backend/src/controllers/MessageController.ts`
- [ ] Hàm `sendMessage(req, res)`
- [ ] Hàm `getMessages(req, res)`
- [ ] Hàm `editMessage(req, res)`
- [ ] Hàm `deleteMessage(req, res)`
- [ ] Hàm `pinMessage(req, res)`
- [ ] Hàm `unpinMessage(req, res)`

#### Task 4.1.4 - Tạo Message routes

- [ ] File: `backend/src/routes/message.routes.ts`
- [ ] Routes:
  - `GET /channels/:channelId/messages` -> getMessages
  - `POST /channels/:channelId/messages` -> sendMessage
  - `PATCH /messages/:messageId` -> editMessage
  - `DELETE /messages/:messageId` -> deleteMessage
  - `PATCH /messages/:messageId/pin` -> pinMessage
  - `PATCH /messages/:messageId/unpin` -> unpinMessage

---

## PHASE 5: Socket.IO Realtime Layer

### PHASE 5.1: Socket Connection & Room Management

#### Task 5.1.1 - Setup Socket middleware & authentication

- [ ] File: `backend/src/sockets/socket.middleware.ts`
- [ ] Hàm `socketAuthMiddleware`:
  - Extract token từ handshake auth
  - Verify JWT
  - Attach user vào socket.data
  - next() hoặc reject
- [ ] Apply middleware trong server.ts:
  ```ts
  io.use(socketAuthMiddleware);
  ```

#### Task 5.1.2 - Tạo Channel Socket Handler

- [ ] File: `backend/src/sockets/channelSocket.ts`
- [ ] Hàm `handleChannelJoin(socket, channelId)`:
  - Validate user là member của channel
  - Join room `channel:<channelId>`
  - Emit `presence:update` tới room (user X online)
- [ ] Hàm `handleChannelLeave(socket, channelId)`:
  - Leave room
  - Emit `presence:update` tới room (user X offline)
- [ ] **Lý thuyết:** Room giúp broadcast chỉ tới user trong channel đó.

#### Task 5.1.3 - Tạo Message Socket Handler

- [ ] File: `backend/src/sockets/messageSocket.ts`
- [ ] Lắng nghe event `message:new`:
  - Validate message
  - Lưu DB (nếu chưa lưu)
  - Emit `message:new` tới room (broadcast)
- [ ] Lắng nghe event `message:update`:
  - Validate
  - Emit `message:update` tới room
- [ ] Lắng nghe event `message:delete`:
  - Emit `message:delete`

#### Task 5.1.4 - Tạo Typing Socket Handler

- [ ] File: `backend/src/sockets/typingSocket.ts`
- [ ] Lắng nghe event `typing:start`:
  - Emit `typing:start` + userId tới room
- [ ] Lắng nghe event `typing:stop`:
  - Emit `typing:stop`
- [ ] **Lý thuyết:** Typing indicator là tín hiệu nhẹ, không cần lưu DB.

#### Task 5.1.5 - Tạo Presence Socket Handler

- [ ] File: `backend/src/sockets/presenceSocket.ts`
- [ ] Maintain map `userId -> socketIds` hoặc `userId -> online: boolean`
- [ ] On connection:
  - Add user to online map
  - Emit `presence:update` + { userId, status: 'online' } tới channel room
- [ ] On disconnect:
  - Remove user (nếu không còn socket nào khác)
  - Emit `presence:update` + { userId, status: 'offline' }
- [ ] **Lý thuyết:** Presence track online/offline status, phát signal khi thay đổi.

#### Task 5.1.6 - Tạo Request Socket Handler

- [ ] File: `backend/src/sockets/requestSocket.ts`
- [ ] Lắng nghe event `join_request:new`:
  - Broadcast tới owner/admin của workspace
- [ ] Lắng nghe event `join_request:approved`:
  - Notify user request được duyệt
- [ ] Lắng nghe event `join_request:rejected`

#### Task 5.1.7 - Tạo Meeting Socket Handler

- [ ] File: `backend/src/sockets/meetingSocket.ts`
- [ ] Lắng nghe event `meeting:start`:
  - Broadcast banner tới channel room
- [ ] Lắng nghe event `meeting:end`
- [ ] **Lý thuyết:** Meeting events là business events, phát tới toàn channel.

#### Task 5.1.8 - Gắn tất cả handlers vào server

- [ ] File: `backend/src/sockets/index.ts`
- [ ] Export setup function tất cả handlers
- [ ] File: `backend/src/server.ts`
- [ ] Call setup function khi khởi tạo io:
  ```ts
  setupSocketHandlers(io);
  ```

---

## PHASE 6: Channel Directory Frontend

### PHASE 6.1: API Client Service

#### Task 6.1.1 - Tạo channelApi.ts

- [ ] File: `frontend/src/services/channelApi.ts`
- [ ] Hàm `getChannelDirectory(workspaceId, query)`:
  - `GET /api/v1/workspaces/:workspaceId/channels?search=...&type=...&category=...&page=...`
- [ ] Hàm `getChannel(channelId)`
- [ ] Hàm `createChannel(workspaceId, data)`
- [ ] Hàm `updateChannel(channelId, data)`
- [ ] Hàm `deleteChannel(channelId)`
- [ ] Hàm `archiveChannel(channelId)`
- [ ] Hàm `joinChannel(channelId)`
- [ ] Hàm `leaveChannel(channelId)`
- [ ] Hàm `requestAccess(channelId, message?)`
- [ ] Hàm `getPendingRequests(channelId)`
- [ ] Hàm `approveRequest(requestId)`
- [ ] Hàm `rejectRequest(requestId)`

#### Task 6.1.2 - Tạo Zustand channelStore

- [ ] File: `frontend/src/store/channelStore.ts`
- [ ] State:
  - `channels: Channel[]`
  - `currentChannel: Channel | null`
  - `isLoading: boolean`
  - `error: string | null`
  - `filters: { search, type, category, page }`
  - `pendingRequests: Request[]`
  - `selectedRequestId: string | null`
- [ ] Actions:
  - `setChannels(channels)`
  - `setCurrentChannel(channel)`
  - `addChannel(channel)`
  - `updateChannel(channelId, updates)`
  - `removeChannel(channelId)`
  - `setFilters(filters)`
  - `setPendingRequests(requests)`
  - `addPendingRequest(request)`
  - `removePendingRequest(requestId)`

#### Task 6.1.3 - Tạo React Query hooks

- [ ] File: `frontend/src/hooks/useChannels.ts`
- [ ] Hook `useChannelDirectory`:
  - Query channel list
  - Hỗ trợ search, filter, pagination
  - Cache, auto-refetch background
- [ ] Hook `useChannel`:
  - Query 1 channel by ID
- [ ] Hook `usePendingRequests`:
  - Query pending requests của channel
- [ ] Hàm mutation:
  - `useCreateChannel()`
  - `useUpdateChannel()`
  - `useDeleteChannel()`
  - `useJoinChannel()`
  - `useLeaveChannel()`
  - `useRequestAccess()`
  - `useApproveRequest()`
  - `useRejectRequest()`

---

### PHASE 6.2: Components

#### Task 6.2.1 - Tạo ChannelDirectoryPage

- [ ] File: `frontend/src/app/(dashboard)/channels/page.tsx`
- [ ] Nội dung:
  - Header: "Channel Directory"
  - Search bar
  - Filter tabs (All, Public, Private, Archived)
  - "Create Channel" button
  - "Join Channel" button
  - Channel list (grouped by category)
  - Loading/error states
  - Empty state

#### Task 6.2.2 - Tạo ChannelCard component

- [ ] File: `frontend/src/components/channels/ChannelCard.tsx`
- [ ] Props: channel, onJoin, onLeave, onRequestAccess, ...
- [ ] Display:
  - Channel name (#dev)
  - Type badge (public/private)
  - Description (truncate 2 lines)
  - Member count
  - Last message preview
  - Unread badge
  - Menu (leave/favorite/mute)

#### Task 6.2.3 - Tạo ChannelSearchBar component

- [ ] File: `frontend/src/components/channels/ChannelSearchBar.tsx`
- [ ] Input search
- [ ] OnChange gọi store.setFilters({ search })

#### Task 6.2.4 - Tạo ChannelFilterTabs component

- [ ] File: `frontend/src/components/channels/ChannelFilterTabs.tsx`
- [ ] Tabs: All, Public, Private, Archived, Favorites, Muted
- [ ] OnClick gọi store.setFilters({ type / category })

#### Task 6.2.5 - Tạo ChannelGroupSection component

- [ ] File: `frontend/src/components/channels/ChannelGroupSection.tsx`
- [ ] Props: groupTitle, channels
- [ ] Display group title + member count
- [ ] Grid ChannelCard

#### Task 6.2.6 - Tạo CreateChannelDialog component

- [ ] File: `frontend/src/components/channels/CreateChannelDialog.tsx`
- [ ] Form: name, description, type (public/private)
- [ ] Validate với React Hook Form + Zod
- [ ] On submit: gọi useCreateChannel mutation

#### Task 6.2.7 - Tạo RequestAccessDialog component

- [ ] File: `frontend/src/components/channels/RequestAccessDialog.tsx`
- [ ] Form: message (optional)
- [ ] On submit: gọi useRequestAccess mutation

#### Task 6.2.8 - Tạo PendingRequestsPanel component

- [ ] File: `frontend/src/components/channels/PendingRequestsPanel.tsx`
- [ ] Display pending requests (nếu user là owner/admin)
- [ ] List request với sender name, message
- [ ] Approve/Reject buttons
- [ ] Badge số pending requests

#### Task 6.2.9 - Tạo LoadingSkeleton & EmptyState components

- [ ] File: `frontend/src/components/channels/ChannelCardSkeleton.tsx`
- [ ] File: `frontend/src/components/channels/ChannelEmptyState.tsx`

---

### PHASE 6.3: Integration & Logic

#### Task 6.3.1 - Nối ChannelDirectoryPage vào data

- [ ] Fetch data từ useChannelDirectory hook
- [ ] Pass channels tới ChannelGroupSection
- [ ] Gắn search/filter logic
- [ ] Gắn loading/error states

#### Task 6.3.2 - Test Channel Directory

- [ ] Tải trang -> hiển thị danh sách channel
- [ ] Search -> filter correctly
- [ ] Filter -> type/category correctly
- [ ] Join public channel -> success
- [ ] Request private channel -> success
- [ ] Page responsive desktop/tablet/mobile

---

## PHASE 7: Channel Chat Backend (Message Realtime)

### PHASE 7.1: Message API (đã làm ở PHASE 4, nay chỉ test)

#### Task 7.1.1 - Test Message API

- [ ] `POST /channels/:channelId/messages` -> send message
- [ ] `GET /channels/:channelId/messages` -> load page 1
- [ ] `PATCH /messages/:messageId` -> edit message
- [ ] `DELETE /messages/:messageId` -> delete message
- [ ] Verify permission check
- [ ] Verify error handling

#### Task 7.1.2 - Enhance Message API pagination

- [ ] Cursor-based pagination hoặc timestamp:
  - `GET /channels/:channelId/messages?limit=50&before=<timestamp>`
  - Return messages cũ hơn timestamp đó
- [ ] **Lý thuyết:** Cursor pagination phù hợp hơn offset-limit khi data thay đổi liên tục.

---

### PHASE 7.2: Socket Message Events (đã làm ở PHASE 5, nay enhance)

#### Task 7.2.1 - Enhance message socket events

- [ ] Client emit `message:new` + { channelId, content, attachments?, mentions? }
- [ ] Server validate + lưu DB + emit back tới room
- [ ] Tương tự cho `message:update`, `message:delete`
- [ ] **Lý thuyết:** Emit sau khi lưu DB để ensure consistency.

---

## PHASE 8: Channel Chat Frontend

### PHASE 8.1: Zustand & Socket Setup

#### Task 8.1.1 - Tạo messageStore

- [ ] File: `frontend/src/store/messageStore.ts`
- [ ] State:
  - `messages: Message[]`
  - `isLoadingMessages: boolean`
  - `typingUsers: Set<userId>`
  - `onlineUsers: Set<userId>`
  - `currentThreadId: string | null`
- [ ] Actions:
  - `setMessages(messages)`
  - `addMessage(message)`
  - `updateMessage(messageId, updates)`
  - `removeMessage(messageId)`
  - `prependMessages(messages)` (infinite scroll up)
  - `setTypingUser(userId, status)`
  - `setOnlineUser(userId, status)`

#### Task 8.1.2 - Tạo socketStore

- [ ] File: `frontend/src/store/socketStore.ts`
- [ ] State:
  - `socket: Socket | null`
  - `isConnected: boolean`
  - `activeRoom: string | null`
- [ ] Actions:
  - `setSocket(socket)`
  - `setConnected(boolean)`
  - `joinRoom(channelId)`
  - `leaveRoom()`
  - `emitMessage(content, attachments?, mentions?)`
  - `emitTyping(isTyping)`

#### Task 8.1.3 - Tạo useSocket hook

- [ ] File: `frontend/src/hooks/useSocket.ts`
- [ ] Hook:
  - Khởi tạo socket connection (1 lần)
  - Listen events: `message:new`, `message:update`, `message:delete`, `typing:start`, `typing:stop`, `presence:update`
  - Update stores
  - Cleanup on unmount

#### Task 8.1.4 - Tạo socketService

- [ ] File: `frontend/src/services/socket.ts`
- [ ] Setup socket connection logic riêng
- [ ] Export singleton socket instance

---

### PHASE 8.2: API Hooks

#### Task 8.2.1 - Tạo messageApi.ts

- [ ] File: `frontend/src/services/messageApi.ts`
- [ ] Hàm `getMessages(channelId, { limit, before })`
- [ ] Hàm `sendMessage(channelId, { content, attachments?, mentions? })`
- [ ] Hàm `editMessage(messageId, { content })`
- [ ] Hàm `deleteMessage(messageId)`
- [ ] Hàm `getPinnedMessages(channelId)`

#### Task 8.2.2 - Tạo useMessages hook

- [ ] File: `frontend/src/hooks/useMessages.ts`
- [ ] Hook `useMessages`:
  - Query initial messages
  - Setup infinite scroll (useInfiniteQuery)
- [ ] Hook `useSendMessage` (mutation)
- [ ] Hook `useEditMessage` (mutation)
- [ ] Hook `useDeleteMessage` (mutation)

---

### PHASE 8.3: Components

#### Task 8.3.1 - Tạo ChannelChatPage

- [ ] File: `frontend/src/app/(dashboard)/channels/[channelId]/page.tsx`
- [ ] Nội dung:
  - ChannelHeader (channel info, members, call button)
  - MessageList (infinite scroll, grouping)
  - MessageComposer (send message, upload file)
  - RightSidebar + Tabs (members, files, pinned, activity)
  - ThreadPanel (thread reply side)

#### Task 8.3.2 - Tạo ChannelHeader component

- [ ] File: `frontend/src/components/chat/ChannelHeader.tsx`
- [ ] Display:
  - Channel name
  - Member count
  - Description
  - Search bar (search in messages)
  - Call / Video button
  - Channel info button
  - Menu (mute, favorite, leave, archive)

#### Task 8.3.3 - Tạo MessageList component

- [ ] File: `frontend/src/components/chat/MessageList.tsx`
- [ ] Features:
  - Display messages grouped by user + time
  - Infinite scroll (fetch older messages when scroll up)
  - Virtual scrolling (nếu cần optimize)
  - Unread divider
  - Loading indicator (at top when fetching old messages)
  - **Lý thuyết:** Infinite scroll up: prepend old messages, không reset scroll position.

#### Task 8.3.4 - Tạo MessageGroup component

- [ ] File: `frontend/src/components/chat/MessageGroup.tsx`
- [ ] Props: messages (từ user same + time window)
- [ ] Display:
  - Avatar (1 lần, first message)
  - User name (1 lần)
  - Messages (stacked)
  - Time (group level)

#### Task 8.3.5 - Tạo MessageItem component

- [ ] File: `frontend/src/components/chat/MessageItem.tsx`
- [ ] Display:
  - Message text
  - Reactions
  - Thread count badge
  - Menu (reply, react, edit, delete, pin)
  - Edited label
  - Attachments
  - Mentions highlight

#### Task 8.3.6 - Tạo MessageComposer component

- [ ] File: `frontend/src/components/chat/MessageComposer.tsx`
- [ ] Features:
  - Text input (auto-expand)
  - Mention autocomplete
  - Emoji picker
  - File upload button
  - Send button
  - Typing indicator emit
- [ ] **Lý thuyết:** Composer là entry point tin nhắn, cần thân trọng validation.

#### Task 8.3.7 - Tạo TypingIndicator component

- [ ] File: `frontend/src/components/chat/TypingIndicator.tsx`
- [ ] Display: "John, Jane are typing..."
- [ ] Props: typingUsers (từ store)

#### Task 8.3.8 - Tạo RightSidebar component

- [ ] File: `frontend/src/components/chat/RightSidebar.tsx`
- [ ] Tabs:
  - Members (channel members list)
  - Files (shared files)
  - Pinned (pinned messages)
  - Activity (activity log)

#### Task 8.3.9 - Tạo ThreadPanel component

- [ ] File: `frontend/src/components/chat/ThreadPanel.tsx`
- [ ] Display thread replies của 1 message gốc
- [ ] Mini composer untuk reply
- [ ] Close button

#### Task 8.3.10 - Tạo FilesTab, MembersTab, PinnedTab, ActivityTab components

- [ ] File: `frontend/src/components/chat/tabs/...`

---

### PHASE 8.4: Integration & Logic

#### Task 8.4.1 - Setup socket connection & room join

- [ ] Page mount:
  - `useSocket()` hook initialize
  - Join room `channel:<channelId>`
  - Fetch messages
- [ ] Page unmount:
  - Leave room

#### Task 8.4.2 - Fetch & display messages

- [ ] On mount: fetch initial messages (limit 50, latest)
- [ ] Display grouped + with timestamps
- [ ] Infinite scroll: fetch older messages when scroll up
- [ ] Update lastReadAt khi user scroll/interact

#### Task 8.4.3 - Send message

- [ ] User type + bấm send
- [ ] Optimistic update (thêm message vào list ngay)
- [ ] Emit socket `message:new`
- [ ] Server lưu DB + emit back
- [ ] Client confirm hoặc rollback (nếu error)

#### Task 8.4.4 - Listen realtime events

- [ ] `message:new` -> thêm message vào list
- [ ] `message:update` -> update message
- [ ] `message:delete` -> remove message
- [ ] `typing:start` -> add user vào typingUsers
- [ ] `typing:stop` -> remove user
- [ ] `presence:update` -> update onlineUsers

#### Task 8.4.5 - Test Channel Chat

- [ ] Load page -> display messages
- [ ] Send message -> appear realtime
- [ ] Edit message -> update realtime
- [ ] Delete message -> remove realtime
- [ ] Typing indicator -> show/hide
- [ ] Presence -> online/offline badge
- [ ] Infinite scroll -> load old messages
- [ ] Responsive mobile/desktop

---

## PHASE 9: Thread Conversation (Ưu tiên 2)

### Task 9.1 - Backend ThreadReply API

- [ ] ThreadReplyDAO & Service
- [ ] `GET /messages/:messageId/replies` (get thread)
- [ ] `POST /messages/:messageId/replies` (reply in thread)
- [ ] `PATCH /replies/:replyId` (edit reply)
- [ ] `DELETE /replies/:replyId` (delete reply)

### Task 9.2 - Socket thread events

- [ ] `thread:reply:new`
- [ ] `thread:reply:update`
- [ ] `thread:reply:delete`

### Task 9.3 - Frontend ThreadPanel implementation

- [ ] Fetch thread replies
- [ ] Display replies in panel
- [ ] Send reply
- [ ] Listen realtime updates

---

## PHASE 10: Reactions (Ưu tiên 2)

### Task 10.1 - Backend Reaction API

- [ ] MessageReactionDAO & Service
- [ ] `POST /messages/:messageId/reactions` (add emoji)
- [ ] `DELETE /messages/:messageId/reactions/:emoji` (remove emoji)

### Task 10.2 - Socket reaction events

- [ ] `reaction:add`
- [ ] `reaction:remove`

### Task 10.3 - Frontend Reaction

- [ ] Click message -> emoji picker
- [ ] Select emoji -> emit event
- [ ] Display reaction count

---

## PHASE 11: Unread State (Ưu tiên 2)

### Task 11.1 - Backend unread logic

- [ ] Hàm `updateLastReadAt(channelId, userId, timestamp)`
- [ ] Query `unreadCount = count(messages.createdAt > lastReadAt)`
- [ ] API endpoint: `PATCH /channels/:channelId/read`

### Task 11.2 - Frontend unread

- [ ] Update lastReadAt khi user scroll (debounce)
- [ ] Display unread badge
- [ ] Unread divider line

---

## PHASE 12: Presence (Ưu tiên 2)

### Task 12.1 - Backend presence tracking

- [ ] Presence socket setup (đã làm ở PHASE 5.1.5, nay test + enhance)
- [ ] Map userId -> online status
- [ ] Emit presence events

### Task 12.2 - Frontend presence

- [ ] Listen presence:update
- [ ] Display green dot / online badge trên member avatar

---

## PHASE 13: Notification Badge (Ưu tiên 2)

### Task 13.1 - Backend notification API

- [ ] GET /notifications
- [ ] PATCH /notifications/:id/read
- [ ] DELETE /notifications/:id

### Task 13.2 - Frontend notification

- [ ] Display notification badge (unread count)
- [ ] Show notification dropdown
- [ ] Mark as read

---

## PHASE 14: Pinned Messages (Ưu tiên 2)

### Task 14.1 - Backend pin API

- [ ] PATCH /messages/:messageId/pin
- [ ] PATCH /messages/:messageId/unpin
- [ ] GET /channels/:channelId/pinned

### Task 14.2 - Frontend pin

- [ ] Message menu -> Pin option
- [ ] Right sidebar Pinned tab -> list pinned messages

---

## PHASE 15: File Sharing (Ưu tiên 3)

### Task 15.1 - Setup Cloudinary

- [ ] Tạo Cloudinary account
- [ ] Lấy cloud name, API key, API secret
- [ ] Lưu env variable backend/frontend

### Task 15.2 - Backend file API

- [ ] Tạo FileAssetDAO & Service
- [ ] POST /files/upload (signed upload hoặc server-side)
- [ ] GET /channels/:channelId/files
- [ ] GET /channels/:channelId/media
- [ ] GET /channels/:channelId/links

### Task 15.3 - Frontend file upload

- [ ] File input / drag-drop
- [ ] Upload progress
- [ ] Message attachment

### Task 15.4 - Right sidebar Files tab

- [ ] Display uploaded files
- [ ] Filter: all files, images, documents, links

---

## PHASE 16: Meeting Integration (Ưu tiên 3)

### Task 16.1 - Backend meeting API

- [ ] MeetingDAO & Service
- [ ] POST /channels/:channelId/meetings/start
- [ ] POST /channels/:channelId/meetings/:meetingId/join
- [ ] POST /channels/:channelId/meetings/:meetingId/end

### Task 16.2 - Socket meeting events

- [ ] `meeting:start`
- [ ] `meeting:end`
- [ ] WebRTC signaling events

### Task 16.3 - Frontend meeting

- [ ] Meeting banner in channel header
- [ ] Start meeting button
- [ ] Join meeting action
- [ ] WebRTC integration (tùy scope)

---

## PHASE 17: QA & Testing

### Task 17.1 - Manual testing

- [ ] Create channel
- [ ] Private channel request flow
- [ ] Send/edit/delete message
- [ ] Thread replies
- [ ] Reactions
- [ ] File upload
- [ ] Pin message
- [ ] Presence
- [ ] Typing indicator

### Task 17.2 - Permission testing

- [ ] User not in channel -> can't send message
- [ ] Private channel -> only with approval
- [ ] User not owner -> can't delete message of others
- [ ] User not owner -> can't modify channel

### Task 17.3 - Realtime testing

- [ ] 2 browsers -> message sync realtime
- [ ] Typing indicator -> sync
- [ ] Presence -> online/offline
- [ ] Reaction -> sync

### Task 17.4 - UI/UX testing

- [ ] Mobile responsive
- [ ] Infinite scroll smooth
- [ ] Loading states
- [ ] Error states
- [ ] Empty states

---

## PHASE 18: Deployment & Documentation

### Task 18.1 - Documentation

- [ ] API endpoint docs
- [ ] Socket event docs
- [ ] Database schema docs
- [ ] Frontend component docs

### Task 18.2 - Deployment

- [ ] Backend deploy (Railway/Render)
- [ ] Frontend deploy (Vercel)
- [ ] Environment variables
- [ ] MongoDB Atlas

---

## Summary

- **PHASE 1**: Domain model + Permission = **5-6 hours**
- **PHASE 2**: Channel Directory API = **6-8 hours**
- **PHASE 3**: Request flow = **3-4 hours**
- **PHASE 4**: Message API = **4-5 hours**
- **PHASE 5**: Socket realtime layer = **5-6 hours**
- **PHASE 6**: Channel Directory UI = **6-8 hours**
- **PHASE 7**: Message API test = **2 hours**
- **PHASE 8**: Channel Chat UI = **8-10 hours**
- **PHASE 9-13**: Thread, Reactions, Unread, Presence, Notification = **8-10 hours**
- **PHASE 14**: Pinned messages = **2-3 hours**
- **PHASE 15**: File sharing = **4-5 hours**
- **PHASE 16**: Meeting integration = **4-6 hours**
- **PHASE 17**: QA = **4-5 hours**
- **PHASE 18**: Deployment + Docs = **3-4 hours**

**Total: ~70-90 hours** (tùy scope chi tiết)

---

## Mapping lại với Yêu cầu Module 3 gốc

| Yêu cầu gốc                    | PHASE                 | Task                 |
| ------------------------------ | --------------------- | -------------------- |
| Channel Directory System       | 2                     | 2.1 - 2.3            |
| Private Channel Request System | 3                     | 3.1                  |
| Realtime Channel Chat System   | 7, 8                  | 7.1 - 8.4            |
| File Sharing System            | 15                    | 15.1 - 15.4          |
| Thread & Collaboration System  | 9, 10, 11, 12, 13, 14 | 9-14                 |
| Meeting Integration            | 16                    | 16.1 - 16.3          |
| Domain modeling                | 1                     | 1.1 - 1.2            |
| Permission control             | 1                     | 1.2                  |
| State synchronization          | 5, 8                  | 5.1 - 5.7, 8.1 - 8.4 |

---

## Recommendations

1. **Làm tuần tự**: không nhảy cóc, từng phase một.
2. **Test khi code xong mỗi phase**: không để tech debt.
3. **Commit thường xuyên**: git history rõ.
4. **Ask for help nếu stuck**: đừng giành giật quá lâu.
5. **Khi hoàn phase 8, core chat đã xong**: từ phase 9 trở đi là mở rộng.
