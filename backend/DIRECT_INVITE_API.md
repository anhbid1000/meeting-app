# Direct Invite System Endpoints

## 1. Search Users
Tìm kiếm user theo email hoặc tên để mời.

- **GET** `/api/v1/users/search?q=email_hoac_ten`
- **Auth**: `Required`
- **Response**:
```json
{
  "users": [
    {
      "_id": "64d5f9c7b10c8c5b7839a1d2",
      "name": "Duy Binh",
      "email": "duybinh@uit.edu.vn"
    }
  ]
}
```

## 2. Gửi lời mời trực tiếp (Direct Invite)
Owner gửi lời mời cho một user cụ thể.

- **POST** `/api/v1/workspaces/:workspaceId/invites/direct`
- **Auth**: `Required` (Owner/Admin)
- **Body**:
```json
{
  "email": "user@example.com"
}
```
- **Response**:
```json
{
  "message": "Lời mời đã được gửi",
  "invite": { "_id": "...", "status": "pending" }
}
```

## 3. Lấy danh sách lời mời đang chờ (Pending Invites)
Owner xem lại các lời mời đã gửi nhưng chưa được phản hồi.

- **GET** `/api/v1/workspaces/:workspaceId/invites/direct`
- **Auth**: `Required` (Owner/Admin)
- **Response**:
```json
[
  {
    "_id": "...",
    "invitedEmail": "user@example.com",
    "status": "pending",
    "createdAt": "..."
  }
]
```

## 4. User chấp nhận lời mời
User nhận được lời mời và xác nhận tham gia.

- **POST** `/api/v1/workspace-invites/direct/:inviteId/accept`
- **Auth**: `Required` (User được mời)
- **Response**:
```json
{
  "message": "Đã tham gia workspace thành công",
  "workspaceId": "..."
}
```

## 5. User từ chối lời mời
- **POST** `/api/v1/workspace-invites/direct/:inviteId/reject`
- **Auth**: `Required` (User được mời)
