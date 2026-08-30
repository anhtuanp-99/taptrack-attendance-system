# API Spec — TapTrack
## Hệ thống Chấm công nhân viên ứng dụng ESP32 và Java/Web

Base URL (LAN nội bộ): `http://<server-ip>:8080`

Quy ước chung:
- Content-Type: `application/json`
- Thời gian: ISO-8601 (`2025-01-15T08:05:00`), ngày: `2025-01-15`
- `checkInStatus`: `ON_TIME` (Đúng giờ) / `LATE` (Trễ)
- `checkOutStatus`: `ON_TIME` (Đúng giờ) / `EARLY_LEAVE` (Về sớm) / `MISSING_CHECKOUT` (Thiếu check-out)

## Định dạng response chung — ApiResponse\<T\>

**Mọi REST endpoint** (mục 1-12, 14-17) trả về theo khuôn dạng thống nhất:

```json
{
  "success": true,
  "message": "Mô tả ngắn (tùy chọn)",
  "errorCode": null,
  "data": { }
}
```

Khi lỗi:
```json
{
  "success": false,
  "message": "Mô tả lỗi bằng tiếng Việt",
  "errorCode": "STRING_CONSTANT",
  "data": null
}
```

`data` có thể là object, mảng, hoặc `null` (không có dữ liệu trả về). Để đỡ lặp lại 4 field khung này ở mỗi ví dụ bên dưới, các mục sau chỉ ghi **nội dung bên trong `data`** — hiểu ngầm nó luôn được bọc trong `ApiResponse` như trên.

> **Ngoại lệ:** mục 13 (WebSocket) **không** bọc `ApiResponse` — vì đó là dữ liệu server chủ động đẩy xuống (push event), không phải phản hồi cho 1 request cụ thể nên khái niệm "success/fail" không áp dụng.

## Định dạng phân trang — PageResponse\<T\>

Các API trả về danh sách **có khả năng lớn dần theo thời gian** (mục 6, 14, 15, 18) dùng phân trang — `data` lúc này không phải mảng trần, mà là:

```json
{
  "content": [ ],
  "page": 0,
  "size": 20,
  "totalElements": 254,
  "totalPages": 13
}
```

Query param chung cho các API có phân trang: `?page=0&size=20&sort=fullName,asc` (mặc định `page=0`, `size=20` nếu không truyền).

> Các API danh sách **không có khả năng lớn** (phòng ban, mẫu ca, dashboard hôm nay) **không** áp dụng phân trang — vẫn trả mảng trần như cũ, vì số lượng dòng tự nhiên đã giới hạn (vài chục phòng ban/mẫu ca, tối đa vài trăm dòng dashboard trong 1 ngày).

---

## Nhóm 1 — Chấm công (ESP32 → Backend)

### 1. Quẹt thẻ chấm công
```
POST /api/attendance/card-scan
```
**Request**
```json
{ "cardCode": "04A3B2C1" }
```
**`data` khi check-in mới**
```json
{
  "result": "CHECK_IN",
  "employeeName": "Nguyen Van A",
  "checkInTime": "2025-01-15T08:05:00",
  "checkInStatus": "ON_TIME",
  "ledCommand": "GREEN"
}
```
**`data` khi check-out**
```json
{
  "result": "CHECK_OUT",
  "employeeName": "Nguyen Van A",
  "checkOutTime": "2025-01-15T17:10:00",
  "checkOutStatus": "ON_TIME",
  "ledCommand": "GREEN"
}
```
**Lỗi 404 — thẻ lạ** (FR-5.6): `errorCode: "UNKNOWN_CARD"`, `data: { "ledCommand": "RED" }`
**Lỗi 409 — không có ca hôm nay** (FR-5.8): `errorCode: "NO_SHIFT_TODAY"`, `data: { "ledCommand": "RED" }`
**Lỗi 409 — đã đủ check-in + check-out** (FR-5.7): `errorCode: "ALREADY_COMPLETED"`, `data: { "ledCommand": "RED" }`
**Lỗi 423 — nhân viên INACTIVE**: `errorCode: "EMPLOYEE_INACTIVE"`, `data: { "ledCommand": "RED" }`

> Lưu ý cho code ESP32: `ledCommand` giờ nằm trong `data.ledCommand` (kể cả lúc lỗi, `data` không phải `null` mà vẫn có `ledCommand` để ESP32 biết bật đèn gì) — cần `doc["data"]["ledCommand"]` khi parse bằng ArduinoJson, không phải `doc["ledCommand"]`.

---

## Nhóm 2 — Đăng nhập & phân quyền

### 2. Đăng nhập (chung cho mọi role)
```
POST /api/auth/login
```
**Request**
```json
{ "email": "a.nguyen@company.com", "password": "..." }
```
**`data`**
```json
{
  "accessToken": "eyJhbGciOi...",
  "refreshToken": "8f3b2c1a-....",
  "role": "EMPLOYEE",
  "accessTokenExpiresIn": 900,
  "refreshTokenExpiresIn": 604800
}
```
**Lỗi 401** — sai email/password · **Lỗi 423** — tài khoản INACTIVE

> Từ đây, các API `/api/admin/**` yêu cầu `accessToken` role ADMIN; `/api/employee/**` yêu cầu `accessToken` role EMPLOYEE (header `Authorization: Bearer <accessToken>`). `accessToken` sống ngắn (15 phút), `refreshToken` sống dài hơn (7 ngày) và được lưu trong DB để có thể thu hồi.

### 2b. Làm mới Access Token
```
POST /api/auth/refresh
```
**Request**
```json
{ "refreshToken": "8f3b2c1a-...." }
```
**`data`**
```json
{ "accessToken": "eyJhbGciOi... (mới)", "accessTokenExpiresIn": 900 }
```
**Lỗi 401** — `refreshToken` không tồn tại, đã hết hạn, hoặc đã bị thu hồi (`errorCode: "INVALID_REFRESH_TOKEN"`)

### 2c. Đăng xuất
```
POST /api/auth/logout
```
**Request**
```json
{ "refreshToken": "8f3b2c1a-...." }
```
**`data`** — `null`, chỉ cần `success: true`

> Thu hồi (`revoked = true`) đúng `refreshToken` đó trong DB — các `accessToken` đã cấp trước đó vẫn còn hiệu lực đến khi tự hết hạn (15 phút), không bị vô hiệu ngay lập tức, đây là đánh đổi chấp nhận được giữa đơn giản và bảo mật tuyệt đối cho quy mô dự án này.

### 3. Tạo tài khoản mới (Admin) — dùng chung cho mọi role
```
POST /api/admin/accounts
```
**Request — tạo Admin**
```json
{ "fullName": "Tran Thi HR", "email": "hr2@company.com", "password": "...", "role": "ADMIN" }
```
**Request — tạo Employee** (kèm `employeeProfile`, bắt buộc khi `role = EMPLOYEE`)
```json
{
  "fullName": "Nguyen Van A",
  "email": "a.nguyen@company.com",
  "password": "...",
  "role": "EMPLOYEE",
  "employeeProfile": {
    "employeeCode": "NV001",
    "cardCode": "04A3B2C1",
    "departmentId": 1,
    "jobTitle": "Backend Developer"
  }
}
```
**`data` — tạo Admin**
```json
{ "id": 56, "fullName": "Tran Thi HR", "role": "ADMIN" }
```
**`data` — tạo Employee**
```json
{ "id": 56, "fullName": "Nguyen Van A", "role": "EMPLOYEE", "employeeId": 10, "employmentStatus": "ACTIVE" }
```
**Lỗi 400** — `role = EMPLOYEE` nhưng thiếu `employeeProfile`: `errorCode: "EMPLOYEE_PROFILE_REQUIRED"`
**Lỗi 409** — email/cardCode/employeeCode đã tồn tại

> Admin đầu tiên của hệ thống **không** đi qua API này — khởi tạo sẵn qua dữ liệu seed lúc triển khai.

### 3b. Tự đổi mật khẩu (đã đăng nhập, mọi role)
```
PUT /api/auth/change-password
```
**Request**
```json
{ "oldPassword": "...", "newPassword": "..." }
```
**Lỗi 401** — sai mật khẩu cũ

### 3c. Admin đặt lại mật khẩu cho Account khác
```
PUT /api/admin/accounts/{id}/reset-password
```
**Request**
```json
{ "newPassword": "..." }
```

---

## Nhóm 3 — Quản lý phòng ban (Admin)

### 4. Tạo/sửa/xóa phòng ban
```
POST   /api/admin/departments
PUT    /api/admin/departments/{id}
DELETE /api/admin/departments/{id}
```
**Request (POST/PUT)**
```json
{ "name": "Backend" }
```
**Lỗi 409 (DELETE)** — còn nhân viên thuộc phòng ban: `errorCode: "DEPARTMENT_NOT_EMPTY"`

### 5. Danh sách phòng ban
```
GET /api/admin/departments
```
**`data`**
```json
[{ "id": 1, "name": "Backend", "employeeCount": 12 }]
```

---

## Nhóm 4 — Quản lý nhân viên (Admin)

> Tạo nhân viên dùng chung API mục 3 (`POST /api/admin/accounts` với `role: "EMPLOYEE"`).

### 6. Danh sách / chi tiết nhân viên
```
GET /api/admin/employees?departmentId=1&employmentStatus=ACTIVE&page=0&size=20&sort=fullName,asc
GET /api/admin/employees/{id}
```
**`data`** (danh sách — có phân trang)
```json
{
  "content": [
    { "id": 10, "accountId": 56, "fullName": "Nguyen Van A", "employeeCode": "NV001", "cardCode": "04A3B2C1", "departmentId": 1, "jobTitle": "Backend Developer", "employmentStatus": "ACTIVE" }
  ],
  "page": 0,
  "size": 20,
  "totalElements": 254,
  "totalPages": 13
}
```
**`data`** (xem 1 nhân viên — không phân trang, trả thẳng object)
```json
{
  "id": 10,
  "accountId": 56,
  "fullName": "Nguyen Van A",
  "employeeCode": "NV001",
  "cardCode": "04A3B2C1",
  "departmentId": 1,
  "jobTitle": "Backend Developer",
  "employmentStatus": "ACTIVE"
}
```

### 6b. Sửa thông tin nhân viên
```
PUT /api/admin/employees/{id}
```
**Request** (mọi field đều tùy chọn, chỉ gửi field cần sửa)
```json
{ "fullName": "Nguyen Van A2", "departmentId": 2, "jobTitle": "Senior Backend Developer", "cardCode": "05B4C3D2" }
```
**Lỗi 409** — cardCode mới đã được nhân viên khác dùng

### 7. Xóa / vô hiệu hóa nhân viên
```
DELETE /api/admin/employees/{id}
```
**`data` — xóa cứng** (chưa từng chấm công thật) — xóa cả hồ sơ Employee lẫn Account liên kết
```json
{ "result": "HARD_DELETED" }
```
**`data` — chuyển INACTIVE** (đã có lịch sử chấm công)
```json
{ "result": "DEACTIVATED", "employmentStatus": "INACTIVE" }
```

---

## Nhóm 5 — Quản lý ca làm việc & phân ca (Admin)

### 8. Tạo mẫu ca
```
POST /api/admin/shift-templates
```
**Request**
```json
{ "name": "Ca sáng", "startTime": "08:00", "endTime": "12:00" }
```

### 8b. Xóa mẫu ca
```
DELETE /api/admin/shift-templates/{id}
```
**Lỗi 409** — còn phân ca đang tham chiếu tới mẫu ca này: `errorCode: "SHIFT_TEMPLATE_IN_USE"`

### 9. Danh sách mẫu ca
```
GET /api/admin/shift-templates
```

### 10. Phân ca cho nhân viên
```
POST /api/admin/shift-assignments
```
**Request (dùng mẫu ca)**
```json
{ "employeeId": 10, "workDate": "2025-01-16", "shiftTemplateId": 1 }
```
**Request (giờ tùy chỉnh)**
```json
{ "employeeId": 10, "workDate": "2025-01-16", "customStartTime": "09:00", "customEndTime": "13:00" }
```
**Lỗi 409** — nhân viên đã có ca ngày đó (FR-4.5)

### 10b. Sửa / xóa phân ca đã tạo
```
PUT    /api/admin/shift-assignments/{id}
DELETE /api/admin/shift-assignments/{id}
```
**Request (PUT)** — cùng cấu trúc như tạo mới (mục 10)
**Lỗi 409** — `workDate` đã qua, hoặc ngày đó đã có bản ghi chấm công thật: `errorCode: "SHIFT_ASSIGNMENT_LOCKED"`

### 11. Xem lịch phân ca
```
GET /api/admin/shift-assignments?date=2025-01-16&departmentId=1
```

### 12. Xem lịch phân ca theo tuần (1 nhân viên)
```
GET /api/admin/shift-assignments/week?employeeId=10&weekStart=2025-01-13
```
> `weekStart` luôn là ngày Thứ 2 — Backend tự tính đủ 7 ngày Thứ 2 → Chủ nhật từ đó.

**`data`**
```json
{
  "weekStart": "2025-01-13",
  "days": [
    { "date": "2025-01-13", "status": "OFF" },
    { "date": "2025-01-14", "status": "SHIFT", "shiftName": "Ca sáng", "startTime": "08:00", "endTime": "12:00" },
    { "date": "2025-01-15", "status": "SHIFT", "shiftName": "Ca sáng", "startTime": "08:00", "endTime": "12:00" },
    { "date": "2025-01-16", "status": "OFF" },
    { "date": "2025-01-17", "status": "SHIFT", "shiftName": "Ca chiều", "startTime": "13:00", "endTime": "17:00" },
    { "date": "2025-01-18", "status": "OFF" },
    { "date": "2025-01-19", "status": "OFF" }
  ]
}
```
> `status: "OFF"` là Backend **tự suy luận** khi không tìm thấy `ShiftAssignment` cho ngày đó — không lưu dòng riêng, cùng cơ chế với cách suy luận VẮNG (FR-6.5).

---

## Nhóm 6 — Dashboard realtime & Báo cáo (Admin)

### 13. Danh sách chấm công hôm nay
```
GET /api/admin/dashboard/today?departmentId=1
```
**`data`**
```json
{
  "totalAssigned": 20,
  "totalCheckedIn": 15,
  "totalLate": 3,
  "records": [
    { "employeeId": 10, "employeeName": "Nguyen Van A", "checkInTime": "08:05", "checkInStatus": "ON_TIME" }
  ]
}
```

### 14. WebSocket — cập nhật realtime (KHÔNG bọc ApiResponse, xem ghi chú đầu file)
```
Kênh: /topic/attendance
```
**Message đẩy xuống khi có chấm công mới**
```json
{
  "employeeId": 10,
  "employeeName": "Nguyen Van A",
  "type": "CHECK_IN",
  "time": "2025-01-15T08:05:00",
  "status": "ON_TIME"
}
```

### 15. Báo cáo thống kê theo tháng
```
GET /api/admin/reports/monthly?employeeId=10&month=2025-01
GET /api/admin/reports/monthly?departmentId=1&month=2025-01
```
**`data`**
```json
{
  "employeeId": 10,
  "month": "2025-01",
  "onTimeDays": 18,
  "lateDays": 2,
  "earlyLeaveDays": 1,
  "absentDays": 1,
  "missingCheckoutDays": 0
}
```

### 16. Danh sách nhân viên vắng hôm nay
```
GET /api/admin/reports/absent-today?departmentId=1
```

---

## Nhóm 7 — Sửa tay bản ghi chấm công (Admin, FR-9.3)

### 17. Sửa/bổ sung bản ghi chấm công
```
PUT /api/admin/attendance-records
```
**Request**
```json
{
  "employeeId": 10,
  "workDate": "2025-01-15",
  "checkInTime": "08:05:00",
  "checkOutTime": "17:10:00"
}
```
**`data`**
```json
{
  "employeeId": 10,
  "workDate": "2025-01-15",
  "checkInStatus": "ON_TIME",
  "checkOutStatus": "ON_TIME",
  "isManualEdit": true
}
```
> Hệ thống tự tính lại `checkInStatus`/`checkOutStatus` dựa trên giờ mới nhập — Admin không được gán thẳng trạng thái.

---

## Nhóm 8 — Nhân viên tự xem lịch sử (Employee)

### 18. Lịch sử chấm công cá nhân
```
GET /api/employee/my-attendance?from=2025-01-01&to=2025-01-15&page=0&size=20
```
> Lấy `employeeId` từ token đăng nhập — nhân viên không thể truyền `employeeId` của người khác.

**`data`** (có phân trang — lịch sử có thể rất dài với nhân viên lâu năm)
```json
{
  "content": [
    {
      "workDate": "2025-01-15",
      "checkInTime": "08:05:00",
      "checkOutTime": "17:10:00",
      "checkInStatus": "ON_TIME",
      "checkOutStatus": "ON_TIME"
    }
  ],
  "page": 0,
  "size": 20,
  "totalElements": 187,
  "totalPages": 10
}
```

### 18b. Xem lịch phân ca theo tuần (chính mình)
```
GET /api/employee/my-schedule/week?weekStart=2025-01-13
```
> `employeeId` lấy từ token đăng nhập. Cùng cấu trúc `data` như mục 12 (Admin xem lịch tuần).

---

## Danh sách `errorCode` và HTTP Status tương ứng

| HTTP Status | errorCode | Khi nào |
|---|---|---|
| 400 | `EMPLOYEE_PROFILE_REQUIRED` | Tạo Account role EMPLOYEE nhưng thiếu `employeeProfile` |
| 400 | `INVALID_REQUEST` | Dữ liệu không hợp lệ (dùng chung cho lỗi `@Valid`) |
| 401 | — | Sai email/password / chưa đăng nhập |
| 403 | — | Không đủ quyền (Employee gọi API của Admin) |
| 404 | `UNKNOWN_CARD` | Quẹt thẻ không tồn tại trong hệ thống |
| 404 | — | Không tìm thấy nhân viên/phòng ban/bản ghi |
| 409 | `NO_SHIFT_TODAY` | Quẹt thẻ nhưng không có ca hôm nay |
| 409 | `ALREADY_COMPLETED` | Quẹt thẻ lần 3 trở lên trong ngày |
| 409 | `DEPARTMENT_NOT_EMPTY` | Xóa phòng ban còn nhân viên |
| 409 | `SHIFT_TEMPLATE_IN_USE` | Xóa mẫu ca đang có phân ca tham chiếu |
| 409 | `SHIFT_ASSIGNMENT_LOCKED` | Sửa/xóa phân ca đã qua ngày hoặc đã có chấm công thật |
| 409 | — | Trùng cardCode/email/employeeCode, trùng ca trong ngày |
| 423 | `EMPLOYEE_INACTIVE` | Nhân viên/Account đã bị vô hiệu hóa |
| 500 | — | Lỗi hệ thống không lường trước |
