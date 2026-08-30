# Cấu trúc Frontend — TapTrack

Công nghệ: HTML/CSS/JavaScript thuần + SockJS/STOMP.js (WebSocket) + Fetch API (REST)
Vị trí: `src/main/resources/static/` (trong project Spring Boot, phục vụ chung 1 cổng với Backend)

## Cây thư mục

```
static/
├── shared/
│   ├── css/base.css
│   └── js/
│       ├── api.js                 (tự bóc data khỏi ApiResponse<T>, tự kiểm tra success/errorCode)
│       ├── auth-guard.js          (kiểm tra token JWT, redirect nếu thiếu/hết hạn)
│       ├── change-password.js     (dùng chung 2 portal, gọi PUT /api/auth/change-password)
│       └── pagination.js          (render nút chuyển trang dùng chung cho employees.js, history.js)
│
├── employee/
│   ├── login.html
│   ├── history.html               (có khung phân trang cuối bảng)
│   ├── schedule.html               (lịch tuần chính mình, GET /api/employee/my-schedule/week)
│   ├── css/employee.css
│   └── js/
│       ├── login.js
│       ├── history.js             (đọc data.content, gọi renderPagination())
│       └── schedule.js
│
└── admin/
    ├── login.html
    ├── dashboard.html               (trang chính — realtime qua WebSocket)
    ├── departments.html
    ├── employees.html               (tạo/sửa/xem, có khung phân trang cuối bảng)
    ├── shifts.html                  (tạo/sửa/xóa phân ca, hiển thị dạng lưới tuần)
    ├── accounts.html                 (quản lý tài khoản Admin khác)
    ├── reports.html
    ├── css/admin.css
    └── js/
        ├── login.js
        ├── dashboard.js             (kết nối WebSocket /topic/attendance, render bảng realtime)
        ├── departments.js
        ├── employees.js              (đọc data.content, gọi renderPagination())
        ├── shifts.js                 (tạo/sửa/xóa phân ca, vẽ lưới tuần)
        ├── accounts.js
        └── reports.js
```

## Sơ đồ bố trí (wireframe dạng text)

### Employee Portal — trang đăng nhập

```
┌──────────────────────────────────────┐
│              TapTrack                │
│         (logo/tên hệ thống)           │
│                                        │
│   ┌──────────────────────────────┐   │
│   │ Email                         │   │
│   └──────────────────────────────┘   │
│   ┌──────────────────────────────┐   │
│   │ Mật khẩu                      │   │
│   └──────────────────────────────┘   │
│                                        │
│         [   Đăng nhập   ]             │
└──────────────────────────────────────┘
```

### Employee Portal — lịch sử chấm công cá nhân

```
┌──────────────────────────────────────────────────┐
│ TapTrack          Nguyen Van A        [Đăng xuất] │
├──────────────────────────────────────────────────┤
│  Lịch sử chấm công                                │
│  [ Từ ngày __ ]  [ Đến ngày __ ]   [ Lọc ]        │
│ ┌────────────┬─────────┬─────────┬────┬────┐     │
│ │ Ngày       │ Vào     │ Ra      │V.trạng│R.trạng│
│ ├────────────┼─────────┼─────────┼────┼────┤     │
│ │ 15/01/2025 │ 08:05   │ 17:10   │Đúng│Đúng│     │
│ │ 14/01/2025 │ 08:20   │ 17:00   │Trễ │Đúng│     │
│ └────────────┴─────────┴─────────┴────┴────┘     │
│         « Trước   1  [2]  3 ... 10   Sau »        │
└──────────────────────────────────────────────────┘
```

### Admin Dashboard — trang quản lý nhân viên

```
┌───────────┬────────────────────────────────────────┐
│ Sidebar   │  Nhân viên            [+ Thêm nhân viên]│
│ (như trên)├────────────────────────────────────────┤
│           │ ┌──────────┬────────┬─────────┬───────┐│
│           │ │Họ tên    │Phòng ban│Chức danh│Sửa/Xóa││
│           │ ├──────────┼────────┼─────────┼───────┤│
│           │ │Nguyen V.A│Backend │Developer│ [✎][🗑]││
│           │ │Tran T.B  │QA      │Tester   │ [✎][🗑]││
│           │ └──────────┴────────┴─────────┴───────┘│
│           │      « Trước  1 [2] 3 ... 13  Sau »     │
└───────────┴────────────────────────────────────────┘
```

### Admin Dashboard — khung layout chung (sidebar cố định)

```
┌───────────┬────────────────────────────────────────┐
│ TapTrack  │  [Phòng ban: Tất cả ▾]      [Admin ▾]   │
│  Admin    ├────────────────────────────────────────┤
│           │                                          │
│ Dashboard │        (nội dung trang thay đổi          │
│ Phòng ban │         theo mục đang chọn ở sidebar)    │
│ Nhân viên │                                          │
│ Ca làm    │                                          │
│ Báo cáo   │                                          │
│           │                                          │
└───────────┴────────────────────────────────────────┘
```

### Admin Dashboard — trang chính (realtime)

```
┌───────────┬────────────────────────────────────────┐
│ Sidebar   │  Hôm nay: 15/20 đã chấm công · 3 trễ    │
│ (như trên)├────────────────────────────────────────┤
│           │ ┌──────────┬───────┬───────┬─────────┐ │
│           │ │Nhân viên │Vào    │Trạng thái│Cập nhật│ │
│           │ ├──────────┼───────┼───────┼─────────┤ │
│           │ │Nguyen V.A│08:05  │Đúng giờ│vừa xong │ │
│           │ │Tran T.B  │08:22  │Trễ     │2 phút   │ │
│           │ └──────────┴───────┴───────┴─────────┘ │
└───────────┴────────────────────────────────────────┘
```
