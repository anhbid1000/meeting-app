# Module 3 - Hiện thực hóa Channel Directory & Channel Chat

## 1. Mục tiêu của module này là gì?

Module 3 yêu cầu biến phần **channels** của hệ thống `meeting-app` từ mức **prototype giao diện** thành một phần mềm gần với sản phẩm thật.

Hai khu vực chính phải làm:

1. **Channel Directory Page**
   - Hiển thị danh sách channel trong workspace.
   - Cho phép tìm kiếm, lọc, nhóm, tham gia, rời channel.
   - Hỗ trợ phân biệt public/private.
   - Hỗ trợ luồng request vào private channel.

2. **Individual Channel Chat Page**
   - Hiển thị tin nhắn theo thời gian thực.
   - Cho phép gửi/nhận tin nhắn realtime.
   - Hỗ trợ thread, reaction, file, presence, meeting integration.

Nói ngắn gọn: đây không còn là bài dựng UI, mà là bài xây một **collaboration module** theo phong cách Slack/Discord/Teams.

---

## 2. Context hiện tại của dự án

### 2.1. Hiện trạng frontend

Frontend hiện dùng:
- **Next.js App Router**
- **React**
- **TypeScript**
- **Tailwind CSS**
- **Zustand**
- **React Hook Form + Zod**
- **socket.io-client**

Hiện đã có sẵn 2 page liên quan:
- `frontend/src/app/(dashboard)/channels/page.tsx`
- `frontend/src/app/(dashboard)/channels/[channelId]/page.tsx`

Nhưng hai page này hiện chủ yếu đang là **mock data + UI tĩnh**:
- danh sách channel đang hard-code
- tin nhắn đang hard-code
- chưa nối API thật
- chưa có state realtime thật
- chưa có permission flow thật

### 2.2. Hiện trạng backend

Backend hiện dùng:
- **Node.js + Express + TypeScript**
- **MongoDB + Mongoose**
- **Socket.IO**
- kiến trúc lớp: `Route -> Controller -> Service -> DAO -> Model`

Hiện backend đã có một phần nền móng:
- `server.ts` có Express + Socket.IO + MongoDB connection
- đã có model `Channel`, `Message`, `AccessRequest`
- đã có workspace module hoạt động ở mức nào đó

Nhưng phần channel/chat vẫn chưa hoàn thiện:
- chưa có route/channel service hoàn chỉnh
- socket mới chỉ dừng ở mức connect/disconnect
- chưa có realtime business event
- auth hiện vẫn là fake auth middleware cho dev

### 2.3. Các model đã có và ý nghĩa

#### `Channel.model.ts`
Đã có các field cơ bản:
- `workspaceId`
- `name`
- `description`
- `slug`
- `type`: `public | private`
- `createdBy`
- `members`

=> Nghĩa là dự án đã có nền tảng để quản lý kênh theo workspace.

#### `AccessRequest.model.ts`
Đã có cấu trúc cho luồng xin quyền truy cập:
- `channelId`
- `workspaceId`
- `senderId`
- `recipientId`
- `type`: `invite | request`
- `status`: `pending | accepted | rejected | expired | revoked`
- `message`

=> Đây là nền cho **private channel approval flow**.

#### `Message.model.ts`
Đã có message cơ bản:
- `workspaceId`
- `channelId`
- `userId`
- `content`
- timestamps

=> Có nền để lưu tin nhắn, nhưng còn thiếu khá nhiều thứ cho collaboration thực tế.

---

## 3. Hiểu đúng yêu cầu Module 3

Module 3 không chỉ yêu cầu “làm trang channel”.
Nó thực chất yêu cầu xây một **subsystem hoàn chỉnh** gồm 6 mảng:

1. **Channel Directory System**
2. **Private Channel Request System**
3. **Realtime Channel Chat System**
4. **File Sharing System**
5. **Thread & Collaboration System**
6. **Meeting Integration**

Nói theo góc nhìn kỹ thuật phần mềm, đây là một bài về:
- **domain modeling**
- **real-time architecture**
- **permission control**
- **state synchronization**
- **UX cho phần mềm cộng tác**

---

## 4. Ý tưởng giải quyết tổng thể

Thay vì làm dàn trải, nên chia bài toán theo **thứ tự phụ thuộc** từ nền tảng đến tính năng nâng cao.

### Giai đoạn 1 - Hoàn thiện nền dữ liệu và permission
Làm trước:
- Channel CRUD
- Join/leave channel
- Private channel request flow
- Channel membership check
- Workspace role check

Lý do:
- Nếu chưa có membership và permission đúng, toàn bộ chat realtime phía sau sẽ bị sai logic.

### Giai đoạn 2 - Làm chat cơ bản hoạt động thật
Làm tiếp:
- load danh sách message
- gửi message qua API
- broadcast message qua Socket.IO
- đồng bộ message realtime
- typing indicator

Lý do:
- Đây là “đường sống” của trang channel chat.
- Khi chat cơ bản chạy ổn rồi mới mở rộng thread/file/reaction.

### Giai đoạn 3 - Nâng cấp collaboration features
Làm tiếp:
- thread replies
- reactions
- unread state
- presence
- notification
- pinned messages

Lý do:
- Các tính năng này phụ thuộc trên message và socket event đã ổn định.

### Giai đoạn 4 - File sharing và meeting integration
Làm sau:
- upload file Cloudinary
- file message
- shared files/media/links panel
- meeting status / start / join

Lý do:
- Đây là các module mở rộng, giá trị cao nhưng phụ thuộc khá nhiều vào nền channel/message.

---

## 5. Lộ trình công việc rõ ràng, tuần tự

## Bước 1. Chuẩn hóa domain model

### Cần làm
Rà soát và bổ sung model để đủ cho yêu cầu.

### Đề xuất model chính
- `Workspace`
- `WorkspaceMember`
- `Channel`
- `ChannelMember`
- `AccessRequest` hoặc đổi tên rõ hơn thành `ChannelJoinRequest`
- `Message`
- `MessageReaction`
- `ThreadReply`
- `FileAsset`
- `Notification`
- `Meeting`

### Vì sao cần bước này?
Nếu domain model yếu thì phía sau sẽ vá rất mệt.
Ví dụ:
- nếu chỉ lưu `members` là mảng ObjectId trong `Channel`, sẽ khó mở rộng role theo channel, mute state, joinedAt, lastReadAt.
- nếu `Message` chỉ có `content`, sẽ thiếu message type, file, system event, meeting event.

### Khuyến nghị cải tiến

#### `Channel`
Nên bổ sung:
- `isArchived`
- `category` hoặc `groupName`
- `createdAt`, `updatedAt`
- `lastMessageAt`
- `memberCount`

#### `ChannelMember`
Nên dùng model riêng thay vì chỉ nhét `members[]` trong Channel.

Ví dụ field:
- `channelId`
- `userId`
- `role` (`owner`, `admin`, `member` nếu cần)
- `joinedAt`
- `lastReadAt`
- `isMuted`
- `isFavorite`

**Lý thuyết:**
Tách bảng/collection quan hệ thành model riêng là cách chuẩn khi quan hệ nhiều-nhiều chứa thêm thuộc tính.

Ở đây:
- Một channel có nhiều user
- Một user thuộc nhiều channel
- Quan hệ đó còn có metadata như `joinedAt`, `lastReadAt`

=> Đây là **many-to-many relationship with attributes**.

Nếu chỉ lưu `members: ObjectId[]`, ta biết “ai thuộc channel”, nhưng không biết:
- vào khi nào
- đã đọc đến đâu
- có mute không
- có favorite không

Vì vậy, tách `ChannelMember` là giải pháp chuẩn hơn.

#### `Message`
Nên mở rộng thành:
- `type`: `text | file | system | meeting`
- `content`
- `attachments`
- `threadCount`
- `isEdited`
- `editedAt`
- `isDeleted`
- `deletedAt`
- `mentions`
- `pinned`

**Lý thuyết:**
Một hệ chat thật không chỉ có plain text. Nó phải hỗ trợ nhiều loại message khác nhau.

Ví dụ:
- người dùng gõ văn bản -> `text`
- gửi file -> `file`
- hệ thống báo “John joined channel” -> `system`
- hệ thống báo “Meeting started” -> `meeting`

Đây gọi là **message polymorphism theo type**.
Không nhất thiết phải dùng inheritance phức tạp; chỉ cần `type + payload fields` là đủ cho giai đoạn hiện tại.

---

## Bước 2. Thiết kế permission system đúng ngay từ đầu

### Cần làm
Xây middleware và service check quyền cho:
- xác thực người dùng
- user có thuộc workspace không
- user có thuộc channel không
- user có quyền duyệt request không
- user có quyền tạo/sửa/xóa channel không

### Phân quyền nên có

#### Workspace role
- `OWNER`
- `ADMIN`
- `MEMBER`

#### Channel actions
- xem channel
- join public channel
- request private channel
- approve/reject request
- gửi message
- upload file
- chỉnh sửa channel

### Middleware đề xuất
- `requireAuth`
- `requireWorkspaceMember`
- `requireWorkspaceRole(...roles)`
- `requireChannelMember`
- `requireChannelAccess`

### Lý thuyết
Permission system là lớp kiểm soát truy cập của hệ thống.

Có 2 kiểu kiểm soát phổ biến:

#### 1. RBAC - Role-Based Access Control
Quyền được cấp dựa trên vai trò.
Ví dụ:
- OWNER được xóa channel
- MEMBER không được xóa channel

#### 2. ABAC - Attribute-Based Access Control
Quyền dựa trên thuộc tính, điều kiện.
Ví dụ:
- user chỉ được vào channel nếu channel là public hoặc đã là member
- request chỉ được approve nếu user là owner/admin của workspace chứa channel đó

Trong module này, hợp lý nhất là dùng **RBAC + điều kiện nghiệp vụ**.
Tức là:
- vai trò cho ta “khung quyền”
- trạng thái resource cho ta “điều kiện thực thi”

---

## Bước 3. Hoàn thiện Channel Directory backend

### API nên có

#### Channel APIs
- `POST /workspaces/:workspaceId/channels`
- `GET /workspaces/:workspaceId/channels`
- `GET /workspaces/:workspaceId/channels/:channelId`
- `PATCH /workspaces/:workspaceId/channels/:channelId`
- `DELETE /workspaces/:workspaceId/channels/:channelId`
- `POST /workspaces/:workspaceId/channels/:channelId/join`
- `POST /workspaces/:workspaceId/channels/:channelId/leave`

#### Query features cho list channel
- search theo tên
- filter theo type/public/private
- filter theo archived
- sort theo activity / name / createdAt

### Lý thuyết
REST API là cách tổ chức endpoint xoay quanh resource.

Ở đây resource chính là:
- workspace
- channel
- message
- request

Ví dụ:
- `GET /workspaces/:id/channels` là lấy danh sách channel thuộc workspace
- `POST /channels/:id/join` là thực hiện hành động join trên channel cụ thể

Khi thiết kế API cần đảm bảo:
- URL rõ resource cha-con
- method đúng ngữ nghĩa (`GET`, `POST`, `PATCH`, `DELETE`)
- response đồng nhất
- validate dữ liệu đầu vào

### Kỹ thuật nên dùng
- Express route
- Controller để nhận request/response
- Service để chứa business logic
- DAO nếu team đang theo pattern này
- Zod để validate body/query

### Vì sao?
Tách lớp giúp:
- dễ test
- dễ thay đổi logic
- controller gọn
- business logic không bị nhét vào route

---

## Bước 4. Hoàn thiện Private Channel Request Flow

### Luồng nghiệp vụ đề xuất

#### Với user thường
1. User thấy channel private.
2. User bấm `Request Access`.
3. Hệ thống tạo `AccessRequest` trạng thái `pending`.
4. Owner/Admin nhận thông báo.

#### Với owner/admin
1. Mở danh sách pending requests.
2. Xem request detail.
3. Approve hoặc Reject.
4. Nếu approve:
   - thêm user vào `ChannelMember`
   - đổi request sang `accepted`
   - bắn socket event + notification
5. Nếu reject:
   - đổi request sang `rejected`
   - bắn notification

### API nên có
- `POST /channels/:channelId/requests`
- `GET /channels/:channelId/requests?status=pending`
- `PATCH /channels/:channelId/requests/:requestId/approve`
- `PATCH /channels/:channelId/requests/:requestId/reject`

### Lý thuyết
Đây là một **state transition flow**.

Trạng thái request thay đổi theo vòng đời:
- `pending`
- `accepted`
- `rejected`
- có thể thêm `expired`, `revoked`

Thiết kế kiểu này gọi là **finite state machine ở mức đơn giản**.

Lợi ích:
- dễ kiểm soát nghiệp vụ
- tránh trạng thái mơ hồ
- dễ validate chuyển trạng thái hợp lệ

Ví dụ:
- `pending -> accepted` hợp lệ
- `accepted -> pending` thường không hợp lệ

=> Service nên kiểm tra transition trước khi update.

---

## Bước 5. Hoàn thiện Channel Directory frontend

### Page hiện tại đang thiếu gì?
Page `channels/page.tsx` đang là mock UI. Cần nâng cấp thành page thật.

### Thành phần nên tách
- `ChannelDirectoryPage`
- `ChannelSearchBar`
- `ChannelFilterTabs`
- `ChannelGroupSection`
- `ChannelCard`
- `CreateChannelDialog`
- `RequestAccessDialog`
- `PendingRequestsPanel`
- `EmptyState`
- `LoadingSkeleton`

### State cần quản lý
- danh sách channel
- search text
- active filters
- pending request count
- loading/error state
- dialog open/close

### Công nghệ nên dùng
- **React Query** cho server state
- **Zustand** cho UI state hoặc cross-page state
- **React Hook Form + Zod** cho form tạo channel / request access
- **react-hot-toast** cho thông báo thao tác thành công/thất bại

### Lý thuyết: Server state vs Client state
Đây là phần rất quan trọng.

#### Server state
Là dữ liệu đến từ backend:
- danh sách channel
- danh sách messages
- pending requests
- notification

Nó có đặc điểm:
- bất đồng bộ
- có thể stale
- cần cache
- cần refetch

=> nên dùng **React Query**.

#### Client/UI state
Là trạng thái giao diện cục bộ:
- modal đang mở không
- tab nào đang active
- draft text hiện tại
- right sidebar đang bật không

=> có thể dùng **Zustand** hoặc local state.

Tách đúng hai loại state giúp code sạch và ít bug hơn.

---

## Bước 6. Hoàn thiện chat backend cơ bản

### API nền cần có
- `GET /channels/:channelId/messages`
- `POST /channels/:channelId/messages`
- `PATCH /messages/:messageId`
- `DELETE /messages/:messageId`

### Socket events nền cần có
- `channel:join`
- `channel:leave`
- `message:new`
- `message:update`
- `message:delete`
- `typing:start`
- `typing:stop`

### Luồng gửi tin nhắn khuyến nghị
1. Client gửi request tạo message.
2. Backend validate quyền user có trong channel.
3. Backend lưu MongoDB.
4. Backend emit event `message:new` tới room của channel.
5. Các client đang mở channel cập nhật UI realtime.

### Lý thuyết: Vì sao vừa REST vừa Socket?

Nhiều người hay nhầm realtime thì chỉ cần socket. Không đúng.

#### REST dùng cho
- thao tác có tính request/response rõ ràng
- load lịch sử ban đầu
- phân trang
- các thao tác CRUD đáng tin cậy

#### Socket dùng cho
- cập nhật realtime
- broadcast tới nhiều client
- typing, presence, notification tức thời

Thiết kế phổ biến nhất là:
- **REST cho persistence + initial fetch**
- **Socket cho synchronization realtime**

Đây là mô hình hợp lý nhất cho app chat hiện đại.

### Lý thuyết: Socket room là gì?
Trong Socket.IO, room là cách nhóm nhiều socket lại.

Ví dụ:
- mọi user đang ở channel A sẽ join room `channel:<id>`
- khi có tin nhắn mới, server chỉ emit vào room đó

Lợi ích:
- không phải broadcast toàn hệ thống
- tiết kiệm tài nguyên
- đúng phạm vi người nhận

---

## Bước 7. Hoàn thiện Channel Chat frontend

### Các phần giao diện chính
- `ChannelHeader`
- `MessageList`
- `MessageGroup`
- `MessageItem`
- `MessageComposer`
- `TypingIndicator`
- `ThreadPanel`
- `RightSidebar`
- `FilesTab`
- `MembersTab`
- `PinnedTab`
- `ActivityTab`

### Luồng frontend nên có
1. Vào page channel.
2. Fetch thông tin channel.
3. Fetch page đầu của messages.
4. Join socket room của channel.
5. Lắng nghe event realtime.
6. Gửi message mới.
7. Cập nhật UI optimistic hoặc sau khi server confirm.

### Lý thuyết: Infinite scroll
Infinite scroll là kỹ thuật tải dần dữ liệu khi người dùng cuộn.

Trong chat thường dùng theo hướng:
- tin nhắn mới nhất ở dưới
- khi cuộn lên trên sẽ load các message cũ hơn

Ưu điểm:
- không load toàn bộ lịch sử một lần
- tiết kiệm băng thông và bộ nhớ
- UX phù hợp cho chat dài

Muốn làm tốt cần:
- cursor pagination hoặc timestamp pagination
- giữ vị trí scroll ổn định khi prepend message cũ

### Lý thuyết: Message grouping
Gom nhóm tin nhắn theo user + khoảng thời gian gần nhau.

Ví dụ cùng một user gửi 3 tin liên tiếp trong 2 phút thì chỉ hiện avatar/tên một lần.

Lợi ích:
- UI gọn hơn
- giống Slack/Discord
- tăng khả năng đọc

---

## Bước 8. Làm thread conversation

### Mục tiêu
Cho phép reply vào một message gốc và mở panel thread riêng.

### Thiết kế dữ liệu có thể chọn

#### Cách 1: Collection riêng `ThreadReply`
Field:
- `parentMessageId`
- `channelId`
- `userId`
- `content`
- `createdAt`

#### Cách 2: Dùng lại `Message` với `parentMessageId`
Tức là message thường có `parentMessageId = null`, reply thread có `parentMessageId != null`.

### Khuyến nghị
Nếu muốn đơn giản và dễ triển khai hiện tại: dùng **Message + parentMessageId** hoặc collection `ThreadReply` riêng tùy phong cách nhóm.

Nếu bám đúng mô tả module thì có thể tách riêng `ThreadReply` để dễ đọc nghiệp vụ.

### Lý thuyết
Thread giúp tránh làm loãng luồng chat chính.

Thay vì mọi câu trả lời chen vào main chat, các trả lời phụ được gom quanh một message gốc.

Về mặt dữ liệu, đây là quan hệ:
- một message gốc
- nhiều replies

=> one-to-many.

---

## Bước 9. Làm reaction, mention, unread, presence

### 9.1 Reaction

#### Kỹ thuật
Có thể lưu reaction theo:
- `messageId`
- `emoji`
- `userId`

Tách model `MessageReaction` là sạch hơn nếu muốn query tốt.

#### Lý thuyết
Reaction là dạng tương tác nhẹ, không tạo message mới.
Nó là metadata gắn với message.

### 9.2 Mention

#### Kỹ thuật
Khi parse message content, phát hiện token như `@username` hoặc chọn user từ mention menu.
Lưu thêm mảng `mentions: userId[]` trong message.

#### Lý thuyết
Mention là một dạng semantic annotation trong nội dung tin nhắn: ngoài text thuần, nó còn chứa ý nghĩa “nhắc đến user X”.

### 9.3 Unread state

#### Kỹ thuật
Lưu `lastReadAt` hoặc `lastReadMessageId` trong `ChannelMember`.

#### Lý thuyết
Unread không nên tính bằng cách quét tất cả message mỗi lần.
Nên lưu checkpoint đọc gần nhất của user, rồi so số lượng message mới hơn checkpoint đó.

### 9.4 Presence

#### Kỹ thuật
Server theo dõi socket connect/disconnect.
Map `userId -> socketIds` hoặc `userId -> online state`.
Emit `presence:update` khi trạng thái thay đổi.

#### Lý thuyết
Presence là trạng thái hiện diện của user trong hệ thống:
- online
- offline
- away
- busy

Nó giúp tăng cảm giác cộng tác thời gian thực.

---

## Bước 10. File sharing với Cloudinary

### Cần làm
- upload file từ client
- backend hoặc client-side signed upload tùy chiến lược
- lưu metadata vào DB
- gắn attachment vào message

### Metadata file nên có
- `url`
- `publicId`
- `fileName`
- `mimeType`
- `size`
- `uploadedBy`
- `channelId`
- `workspaceId`

### Lý thuyết: Vì sao không lưu file trực tiếp trong MongoDB?
Vì file nhị phân lớn không phù hợp để lưu trực tiếp trong document database cho use case này.

Cách chuẩn hơn là:
- file lưu ở object storage / media CDN
- DB chỉ lưu metadata

Cloudinary phù hợp vì:
- có CDN
- tối ưu ảnh/media
- dễ preview
- dễ tích hợp frontend

---

## Bước 11. Meeting integration

### Ý tưởng tối thiểu
- trong channel có nút `Start meeting`
- backend tạo bản ghi meeting
- phát `meeting:start`
- channel hiển thị banner “meeting đang diễn ra”
- user khác bấm join

### Lý thuyết
Meeting integration trong module này không nhất thiết phải hoàn thiện full video call engine ngay.
Điều quan trọng trước là:
- quản lý trạng thái meeting
- hiển thị ngữ cảnh meeting trong channel
- tích hợp với signaling sau

Nếu WebRTC là tầng gọi video/audio, thì channel chat là **coordination layer** để khởi tạo và điều phối cuộc họp.

---

## 6. Công nghệ/kỹ thuật nên sử dụng và lý do

## 6.1 Next.js App Router

### Dùng để làm gì?
- tổ chức routing frontend
- tách layout dashboard
- xây page channel directory và channel detail

### Lý do chọn
- dự án đang dùng sẵn
- phù hợp dashboard app
- routing rõ ràng theo file system
- dễ mở rộng nested layout

### Lý thuyết
App Router là cơ chế routing mới của Next.js, tổ chức route bằng thư mục trong `app/`.

Ví dụ:
- `app/(dashboard)/channels/page.tsx` -> trang danh sách channel
- `app/(dashboard)/channels/[channelId]/page.tsx` -> trang chi tiết channel động

Nó hỗ trợ tốt cho dashboard nhiều layout lồng nhau.

---

## 6.2 React

### Dùng để làm gì?
- xây component UI
- quản lý state và lifecycle của giao diện

### Lý thuyết
React dùng mô hình component-based UI.
Tức là giao diện được chia thành các khối nhỏ tái sử dụng được.

Với bài này, chia component là bắt buộc vì:
- UI lớn
- nhiều tương tác
- cần tái sử dụng card, list, composer, panel

---

## 6.3 TypeScript

### Dùng để làm gì?
- định nghĩa type cho API, model, props, state
- giảm bug runtime

### Lý thuyết
TypeScript là JavaScript có hệ thống kiểu tĩnh.

Trong dự án fullstack có nhiều object phức tạp như:
- Channel
- Message
- AccessRequest
- Notification

TypeScript giúp:
- autocomplete tốt hơn
- refactor an toàn hơn
- dễ đồng bộ contract giữa frontend và backend

---

## 6.4 MongoDB + Mongoose

### Dùng để làm gì?
- lưu dữ liệu workspace, channel, message, request
- định nghĩa schema và index

### Lý thuyết
MongoDB là document database, phù hợp khi dữ liệu linh hoạt và cần phát triển nhanh.

Mongoose cung cấp:
- schema
- validation
- middleware
- index definition
- model abstraction

Với app chat/collaboration, MongoDB khá hợp vì:
- dữ liệu message có tốc độ ghi cao
- cấu trúc có thể mở rộng dần
- document model đủ linh hoạt

Nhưng muốn scale tốt thì phải chú ý index, pagination và giới hạn populate.

---

## 6.5 Express.js

### Dùng để làm gì?
- xây REST API backend
- tổ chức middleware

### Lý thuyết
Express là web framework nhẹ của Node.js.
Nó phù hợp cho các backend cần:
- routing linh hoạt
- middleware chain
- tích hợp dễ với Socket.IO

---

## 6.6 Socket.IO

### Dùng để làm gì?
- realtime message sync
- typing indicator
- presence update
- request/approval notification
- meeting start/end event

### Lý thuyết
Socket.IO cung cấp kết nối hai chiều giữa client và server theo mô hình event-driven.

Khác với HTTP request-response, socket cho phép server chủ động đẩy dữ liệu xuống client ngay khi có thay đổi.

Đây là nền tảng cho trải nghiệm:
- chat tức thời
- badge cập nhật ngay
- online status
- thread/reaction cập nhật đồng bộ

---

## 6.7 Zustand

### Dùng để làm gì?
- lưu state dùng chung phía client
- ví dụ current channel, UI panel state, socket state

### Lý thuyết
Zustand là thư viện state management nhẹ, dùng store theo hook.
Nó phù hợp khi muốn:
- ít boilerplate hơn Redux
- state cục bộ nhưng dùng chung nhiều component

Với bài này, Zustand hợp cho:
- UI state
- socket connection state
- một phần auth/session state

---

## 6.8 React Query

### Dùng để làm gì?
- fetch/caching channel list
- fetch message pages
- invalidate cache sau mutation

### Lý thuyết
React Query giải quyết bài toán server state:
- caching
- stale/fresh
- loading/error
- background refetch
- mutation lifecycle

Đây là lựa chọn gần như chuẩn cho app dashboard hiện đại.

---

## 6.9 React Hook Form + Zod

### Dùng để làm gì?
- form tạo channel
- form request access
- form composer upload / validations cơ bản

### Lý thuyết
React Hook Form tối ưu form theo hướng uncontrolled, giảm re-render.
Zod giúp mô tả schema và validate dữ liệu rõ ràng.

Khi kết hợp lại, ta có:
- validate chắc chắn
- error message rõ
- đồng bộ tư duy schema giữa frontend và backend

---

## 6.10 Tailwind CSS

### Dùng để làm gì?
- dựng nhanh UI dashboard
- kiểm soát spacing/layout/responsive

### Lý thuyết
Tailwind là utility-first CSS framework.
Nó giúp code UI nhanh, nhất quán và dễ responsive nếu dự án đã đi theo hướng component hiện tại.

---

## 6.11 Cloudinary

### Dùng để làm gì?
- lưu file/media
- preview file
- CDN delivery

### Lý do chọn
- triển khai nhanh
- phù hợp đồ án/học phần
- giảm gánh nặng tự quản storage server

---

## 7. Đề xuất cấu trúc triển khai cụ thể

## 7.1 Backend

### Routes
- `routes/channel.routes.ts`
- `routes/message.routes.ts`
- `routes/accessRequest.routes.ts`
- `routes/file.routes.ts`
- `routes/meeting.routes.ts`

### Controllers
- `ChannelController`
- `MessageController`
- `AccessRequestController`
- `FileController`
- `MeetingController`

### Services
- `ChannelService`
- `MessageService`
- `AccessRequestService`
- `PresenceService`
- `NotificationService`
- `MeetingService`

### Socket handlers
- `sockets/channel.socket.ts`
- `sockets/message.socket.ts`
- `sockets/presence.socket.ts`
- `sockets/meeting.socket.ts`

## 7.2 Frontend

### App pages
- `channels/page.tsx`
- `channels/[channelId]/page.tsx`

### Components
- `components/channels/...`
- `components/chat/...`
- `components/thread/...`
- `components/files/...`

### Services
- `services/channelApi.ts`
- `services/messageApi.ts`
- `services/socket.ts`
- `services/fileApi.ts`

### Stores
- `channelStore`
- `messageStore`
- `socketStore`
- `uiStore`

---

## 8. Kế hoạch làm bài theo mức ưu tiên

## Ưu tiên 1 - Bắt buộc để chạy được
1. Channel CRUD
2. Channel list API
3. Join/leave channel
4. Private request flow
5. Message CRUD cơ bản
6. Socket message:new
7. Channel directory nối API thật
8. Channel chat nối API + realtime thật

## Ưu tiên 2 - Làm để đúng chất collaboration
9. Typing indicator
10. Presence
11. Thread replies
12. Reactions
13. Unread state
14. Notification badge

## Ưu tiên 3 - Nâng cao
15. File sharing Cloudinary
16. Shared file/media/link panels
17. Meeting banner + start/join flow
18. Pin message
19. Mention parsing

---

## 9. Kết quả đầu ra mong muốn

Sau khi hoàn thành tốt Module 3, sản phẩm nên đạt được:

- Người dùng xem được danh sách channels theo workspace.
- Người dùng join public channel được.
- Người dùng request private channel được.
- Owner/Admin duyệt request được.
- Tin nhắn trong channel gửi/nhận realtime được.
- Có nền tảng mở rộng cho thread, reaction, file, meeting.
- Giao diện không còn là mock UI mà kết nối dữ liệu thật.
- Kiến trúc đủ sạch để tiếp tục làm các module sau.

---

## 10. Kết luận ngắn gọn

Bản chất Module 3 là xây một **mini Slack subsystem** bên trong `meeting-app`.

Muốn làm tốt thì không nên lao ngay vào sửa UI, mà phải đi theo thứ tự:

1. **chốt domain model**
2. **chốt permission**
3. **làm API channel + request + message**
4. **gắn socket realtime**
5. **nối frontend vào dữ liệu thật**
6. **mở rộng thread/file/presence/meeting**

Nếu đi đúng trình tự đó, bài sẽ vừa chắc về kỹ thuật, vừa đúng tinh thần “vừa làm vừa học”.
