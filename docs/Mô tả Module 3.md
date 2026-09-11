MÔ TẢ CÔNG VIỆC — HIỆN THỰC HÓA CHANNEL DIRECTORY & CHANNEL CHAT

1. Mục tiêu tổng quát
   Xây dựng hoàn chỉnh hệ thống quản lý channel và realtime collaboration chat cho nền tảng workspace/meeting sử dụng kiến trúc MERN stack.
   Hai module chính cần hoàn thiện:
   1.Channel Directory Page
   2.Individual Channel Chat Page
   Hệ thống phải đạt mức production-ready collaboration platform theo hướng:
   - Slack
   - Discord
   - Microsoft Teams
   - Linear
   - ClickUp
   - Notion collaboration
     Dự án không chỉ dừng ở UI prototype mà cần hiện thực đầy đủ:
   - Database
   - REST API
   - Permission system
   - Socket realtime
   - Message synchronization
   - File sharing
   - Private channel approval flow
   - Notification system
   - Meeting integration
   - Thread conversation
   - Presence system

2. Công nghệ & kiến trúc sử dụng
   Frontend
   - Next.js 15 App Router
   - React 18
   - TypeScript
   - Tailwind CSS
   - shadcn/ui
   - Zustand
   - React Hook Form + Zod
     Backend
   - Node.js
   - Express.js
   - Socket.IO
   - MongoDB + Mongoose
     Realtime
   - Socket.IO
   - WebRTC signaling
     File Storage
   - Cloudinary
     Authentication
   - JWT / Session-based auth
     Deployment
   - Vercel (Frontend)
   - Render/Railway (Backend + Socket)

3. Phạm vi chức năng cần triển khai
   A. Channel Directory System
   Chức năng chính
   - Hiển thị danh sách channels theo workspace
   - Group channels theo category/team
   - Search channel
   - Filter channel
   - Sort channel
   - Join public channel
   - Request access private channel
   - Leave channel
   - Favorite/mute channel
   - Create channel
   - Edit channel
   - Archive/Delete channel
   - Pending request state
   - Unread state
   - Channel activity preview
     Phân loại channel
   - Public Channel
   - Private Channel
   - Archived Channel
     Role-based permissions
     OWNER:
   - tạo/sửa/xóa channel
   - approve/reject private request
     ADMIN:
   - tạo/sửa/xóa channel
   - approve/reject private request
     MEMBER:
   - join public channel
   - request private channel

B. Private Channel Request System
Chức năng chính

- User gửi request vào private channel
- OWNER/ADMIN xem pending requests
- Approve request
- Reject request
- Realtime request updates
- Notification khi request được xử lý
  Trạng thái request
- PENDING
- APPROVED
- REJECTED
  UI yêu cầu
- Request detail dialog
- Approve/Reject actions
- Badge số lượng pending
- Toast notifications

C. Channel Chat System
Chức năng chính

- Realtime messaging
- Infinite scroll messages
- Grouped messages
- Thread replies
- Reactions
- Mentions
- Message edit/delete
- Message pinning
- File sharing
- Typing indicator
- Read state
- Presence system
- Link previews
- Right sidebar collaboration panel
  Message types
- TEXT
- FILE
- SYSTEM
- MEETING
  Realtime synchronization
- message:new
- message:update
- message:delete
- reaction:add/remove
- typing:start/stop
- presence:update
- thread:new

D. File Sharing System
Chức năng chính

- Upload file
- Upload image
- Preview attachment
- File message
- Shared files panel
- Shared media panel
- Shared links panel
- Upload progress
- Download/preview file
  Cloudinary Integration
- upload file
- store metadata
- optimize preview
- CDN delivery

E. Thread & Collaboration System
Chức năng chính

- Reply in thread
- Thread side panel
- Realtime thread updates
- Thread participants
- Reply count
  Collaboration UX
- Typing indicator
- Online status
- Read receipts
- Active meeting state
- Presence system

F. Meeting Integration
Chức năng chính

- Start meeting
- Join meeting
- Meeting status banner
- Meeting system messages
- Participant count
- WebRTC signaling integration
  Meeting states
- Scheduled
- Live
- Ended

4. Database cần triển khai
   Collections chính
   - User
   - Workspace
   - WorkspaceMember
   - Channel
   - ChannelMember
   - ChannelJoinRequest
   - Message
   - MessageReaction
   - ThreadReply
   - FileAsset
   - Notification
   - Meeting
     Các mối quan hệ quan trọng
     Workspace
     → có nhiều Channel
     Workspace
     → có nhiều WorkspaceMember
     Channel
     → có nhiều Message
     Channel
     → có nhiều ChannelMember
     Message
     → có nhiều ThreadReply
     Channel
     → có nhiều JoinRequest

5. Backend cần triển khai
   REST API
   Channel APIs
   - create channel
   - update channel
   - archive/delete channel
   - get channel list
   - search/filter channels
   - join/leave channel
     Join Request APIs
   - create request
   - get pending requests
   - approve request
   - reject request
     Message APIs
   - send message
   - edit message
   - delete message
   - get messages
   - reactions
   - pin message
     Thread APIs
   - get thread
   - reply thread
     File APIs
   - upload file
   - get shared files
   - get shared media
     Meeting APIs
   - start meeting
   - join meeting
   - end meeting
     Notification APIs
   - get notifications
   - mark as read

6. Socket.IO realtime layer
   Channel events
   - channel:join
   - channel:leave
     Message events
   - message:new
   - message:update
   - message:delete
     Typing events
   - typing:start
   - typing:stop
     Reaction events
   - reaction:add
   - reaction:remove
     Thread events
   - thread:new
     Presence events
   - presence:update
     Request events
   - join_request:new
   - join_request:approved
   - join_request:rejected
     Meeting events
   - meeting:start
   - meeting:end
   - webrtc signaling events

7. Frontend cần triển khai
   Channel Directory Page
   Components
   - ChannelDirectoryPage
   - ChannelSearchBar
   - ChannelFilterTabs
   - ChannelGroupSection
   - ChannelCard
   - ChannelCardMenu
   - CreateChannelDialog
   - RequestAccessDialog
   - EmptyState
   - LoadingSkeleton
     Features
   - responsive layout
   - search/filter/sort
   - unread badge
   - pending request state
   - public/private badge
   - activity preview

Channel Chat Page
Components

- ChannelChatPage
- ChannelHeader
- MessageList
- MessageGroup
- MessageItem
- MessageActions
- ThreadPanel
- MessageComposer
- TypingIndicator
- RightSidebar
- FilesTab
- MembersTab
- PinnedTab
- ActivityTab
  Features
- realtime messages
- grouped messages
- thread replies
- reactions
- mentions
- file uploads
- presence system
- unread divider
- meeting integration

8. Permission System
   Workspace Roles
   OWNER:
   - full access
     ADMIN:
   - manage channels & requests
     MEMBER:
   - normal collaboration
     Channel Permissions
   - read channel
   - send message
   - upload file
   - manage members
   - manage settings
     Middleware bắt buộc:
   - requireAuth
   - requireWorkspaceMember
   - requireWorkspaceOwnerOrAdmin
   - requireChannelMember

9. State Management
   Zustand stores
   - authStore
   - workspaceStore
   - channelStore
   - messageStore
   - socketStore
   - uiStore
     Quản lý:
   - current channel
   - messages
   - threads
   - typing users
   - notifications
   - pending requests
   - online users

10. UI/UX Requirements
    Bắt buộc hỗ trợ
    - loading states
    - empty states
    - error states
    - reconnecting states
    - responsive desktop/tablet/mobile
    - hover actions
    - toast notifications
    - smooth realtime updates
      Thiết kế hướng tới
    - modern SaaS
    - enterprise-ready
    - productivity-focused
    - realtime collaboration feel

11. Testing & Quality
    Backend tests
    - permission tests
    - request flow tests
    - message flow tests
      Frontend tests
    - component rendering
    - dialog validation
    - realtime update behavior
      E2E tests
    - join channel
    - request private access
    - approve request
    - send message
    - upload file
    - start meeting

12. Kết quả cuối cùng cần đạt
    Sau khi hoàn thành, hệ thống phải cho phép:
    - quản lý channels hoàn chỉnh
    - collaboration realtime
    - private/public channel flow
    - realtime messaging
    - thread conversations
    - file sharing
    - presence system
    - meeting integration
    - scalable workspace structure
      Hai trang phải hoạt động như một phần của một collaboration platform thực tế, không chỉ là UI prototype.
