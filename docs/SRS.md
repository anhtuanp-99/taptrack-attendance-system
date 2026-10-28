# SRS — Đặc tả yêu cầu phần mềm
## Hệ thống Chấm công ứng dụng ESP32 và Spring Boot

### 1. Giới thiệu

**1.1 Mục đích**
Xây dựng hệ thống chấm công nhân viên theo ca làm việc, kết hợp Web Service (Spring Boot) làm trọng tâm và IoT (ESP32) làm phần đọc thẻ từ tại điểm chấm công.

**1.2 Phạm vi**
Nhân viên quẹt thẻ từ để chấm công vào/ra. Hệ thống đối chiếu với ca được phân công để xác định trạng thái vào ca (Đúng giờ / Trễ) và ra ca (Đúng giờ / Về sớm) một cách độc lập; ngày có ca mà không có bản ghi nào được suy luận là Vắng. Nhân viên đăng nhập web để xem lịch sử chấm công và lịch phân ca của mình. Admin (HR) quản lý phòng ban, nhân viên, ca làm việc, phân ca, theo dõi chấm công realtime và xem báo cáo thống kê, có thể lọc theo phòng ban.

**1.3 Đối tượng sử dụng (Actors)**

| Actor | Mô tả |
|---|---|
| Nhân viên (Employee) | Quẹt thẻ chấm công tại ESP32; đăng nhập web để xem lịch sử chấm công và lịch phân ca của mình |
| Quản trị viên (Admin/HR) | Quản lý phòng ban, nhân viên, ca làm việc, phân ca, xem báo cáo, dashboard |
| Thiết bị ESP32 | Đọc thẻ từ, nhận lệnh phản hồi LED/OLED |

### 2. Yêu cầu chức năng (Functional Requirements)

**FR-1: Quản lý phòng ban**
- FR-1.1: Admin tạo/sửa/xóa phòng ban (ví dụ "Backend", "Frontend", "QA", "HR")
- FR-1.2: Không cho xóa phòng ban nếu còn nhân viên thuộc phòng ban đó, kể cả nhân viên INACTIVE (vì lịch sử chấm công của họ vẫn dùng phòng ban này trong báo cáo)

**FR-2: Quản lý nhân viên**
- FR-2.1: Chỉ Admin tạo/sửa hồ sơ nhân viên
- FR-2.2: Khi tạo nhân viên: nhập họ tên (lưu ở Account), mã nhân viên, cardCode, phòng ban, chức danh (text tự do, chỉ để mô tả); đồng thời tạo 1 Account liên kết (email, mật khẩu ban đầu do Admin đặt, role = EMPLOYEE)
- FR-2.3: cardCode duy nhất sau khi chuẩn hóa (trim, uppercase, loại khoảng trắng/ký tự phân cách)
- FR-2.4: Nhân viên không tự đăng ký
- FR-2.5: Admin sửa hồ sơ: họ tên, phòng ban, chức danh, cấp lại cardCode (mất thẻ; không trùng thẻ người khác, cùng quy tắc chuẩn hóa FR-2.3) và **trạng thái làm việc** `employmentStatus` (ACTIVE/INACTIVE)
- FR-2.6: Nhân viên nghỉ việc → Admin chuyển sang **INACTIVE**. Hệ thống **không có xóa cứng nhân viên** (giữ nguyên lịch sử chấm công và báo cáo). Nhân viên INACTIVE: không đăng nhập được (login trả `INVALID_CREDENTIALS`), ESP32 từ chối chấm công (LED đỏ), không được tạo phân ca mới. Có thể chuyển lại ACTIVE.

**FR-3: Đăng nhập & phân quyền**
- FR-3.1: **1 bảng Account chung** (email, mật khẩu hash, họ tên, role `EMPLOYEE`/`ADMIN`) cho cả Admin và Nhân viên
- FR-3.2: Đăng nhập qua **1 cổng chung** bằng email + password; hệ thống xác định role và điều hướng đến Employee Portal hoặc Admin Dashboard
- FR-3.3: `/auth/login` trả **cùng 1 mã lỗi `INVALID_CREDENTIALS` (401)** cho mọi lý do thất bại (sai mật khẩu, email không tồn tại, nhân viên INACTIVE) để không lộ email có tồn tại hay không. Lý do thật chỉ ghi log nội bộ.
- FR-3.4: Role EMPLOYEE chỉ xem được dữ liệu của **chính mình** (lịch sử chấm công, lịch phân ca theo tuần); không truy cập chức năng quản trị
- FR-3.5: Người dùng tự đổi mật khẩu (phải nhập đúng mật khẩu cũ)
- FR-3.6: Admin đặt lại mật khẩu cho Account bất kỳ khi người dùng quên (không cần mật khẩu cũ)
- FR-3.7: Đăng nhập thành công cấp **1 Access Token (JWT)**, không có Refresh Token. Thời hạn mặc định 8 giờ (`JWT_ACCESS_TOKEN_TTL`), hết hạn thì đăng nhập lại. JWT mang `accountId`, `email`, `role` để xác thực stateless, không tra DB mỗi request. Đăng xuất = client xóa token; hệ thống không có danh sách thu hồi nên token đã phát hành còn hiệu lực đến khi hết hạn (kể cả sau khi đổi mật khẩu hoặc nhân viên chuyển INACTIVE). Đây là giới hạn chấp nhận được của đồ án.

**FR-4: Quản lý ca làm việc**
- FR-4.1: Admin tạo các **mẫu ca cố định** (ví dụ "Ca sáng" 8h-12h, "Ca chiều" 13h-17h); giờ kết thúc phải sau giờ bắt đầu, không hỗ trợ ca qua ngày
- FR-4.2: Admin phân ca cho từng nhân viên theo ngày bằng cách chọn 1 mẫu ca
- FR-4.3: Grace period (số phút cho phép trễ) là **1 giá trị chung toàn hệ thống**, đọc từ `@ConfigurationProperties(prefix = "attendance")`; không cấu hình riêng theo ca
- FR-4.4: 1 nhân viên trong 1 ngày chỉ có 1 ca
- FR-4.5: Ngày không có phân ca hiển thị rõ **NGHỈ** khi xem lịch
- FR-4.6: Admin xem lịch phân ca của 1 nhân viên theo **tuần** (Thứ 2 → Chủ nhật), mỗi ngày là có ca (tên ca/giờ) hoặc NGHỈ
- FR-4.7: Admin chỉ sửa/xóa 1 phân ca khi **chưa có `ATTENDANCE_RECORD`** cho nhân viên + ngày đó (kể cả khi nhân viên đã INACTIVE)
- FR-4.8: Không xóa mẫu ca đang được phân ca tham chiếu

**FR-5: Chấm công qua thẻ từ**
- FR-5.1: Nhân viên quẹt thẻ qua đầu đọc gắn ESP32; ESP32 gửi cardCode lên Backend qua HTTP POST
- FR-5.2: Backend xác định **vào ca** hay **ra ca**: chưa có bản ghi trong ngày → check-in; đã có `checkInTime` nhưng chưa có `checkOutTime` → check-out
- FR-5.3: Mỗi nhân viên tối đa 1 check-in và 1 check-out mỗi ngày
- FR-5.4: Backend trả kết quả tức thời để ESP32 hiển thị LED/OLED; response chứa `scanTime` do Backend tạo
- FR-5.5: Thẻ lạ → từ chối, **không tạo bản ghi chấm công**, ghi 1 dòng `UNKNOWN_CARD_LOG` (cardCode, thời gian) để Admin phát hiện bất thường và cấp thẻ; ESP32 nhận LED đỏ
- FR-5.6: Quẹt lần thứ 3 trở lên trong ngày → từ chối, giữ nguyên check-out cũ; cần sửa giờ thì Admin sửa tay (FR-9.3)
- FR-5.7: Không có phân ca hôm nay → từ chối, không tạo bản ghi; LED đỏ
- FR-5.8: **Thứ tự kiểm tra cố định** (dừng và trả lỗi ở bước đầu tiên không qua):
  1. Xác thực `X-Device-API-Key`
  2. Chuẩn hóa cardCode phía server (không tin dữ liệu chuẩn hóa từ ESP32)
  3. Tra Employee theo cardCode (không thấy → `UNKNOWN_CARD`)
  4. Employee ACTIVE? (không → `EMPLOYEE_INACTIVE`)
  5. Có `SHIFT_ASSIGNMENT` hôm nay? (không → `NO_SHIFT_TODAY`)
  6. Trạng thái hôm nay: chưa có bản ghi (check-in) / có `checkInTime` chưa có `checkOutTime` (check-out) / đã đủ 2 lượt (`ATTENDANCE_ALREADY_COMPLETE`)
- FR-5.9: **Race condition**: ràng buộc `UNIQUE(employeeId, workDate)` trên `ATTENDANCE_RECORD` là chốt chặn khi 2 request của cùng 1 nhân viên đến gần như đồng thời. Request INSERT thứ 2 bắt `DataIntegrityViolationException` và trả **409 `SCAN_CONFLICT`** (OLED "Thu lai"); nhân viên quẹt lại là được xử lý đúng (check-out).

**FR-6: Phân loại trạng thái chấm công**
- FR-6.1: Mỗi bản ghi có **2 cờ độc lập**: `checkInStatus` và `checkOutStatus` (1 người có thể vừa Trễ vừa Về sớm)
- FR-6.2: Check-in trong hoặc trước grace period (tính từ giờ bắt đầu ca) → **ĐÚNG GIỜ**
- FR-6.3: Check-in sau grace period → **TRỄ**, số phút trễ lưu ở `lateMinutes`
- FR-6.4: Check-out trước giờ kết thúc ca (dù chỉ 1 phút, không áp dụng grace period) → **VỀ SỚM**, số phút lưu ở `earlyLeaveMinutes`; ngược lại → **ĐÚNG GIỜ**
- FR-6.5: **VẮNG không tạo bản ghi**, được suy luận khi cần bằng cách so sánh danh sách phân ca với danh sách có check-in:
  - Ngày đã qua: có phân ca, không có bản ghi → **VẮNG**
  - Ngày hôm nay: chỉ tính VẮNG khi đã quá `giờ bắt đầu ca + grace period` mà chưa check-in; trước đó là **CHƯA ĐẾN CA**. Nếu sau đó nhân viên quẹt thẻ thì nhận TRỄ, không còn là vắng.
  - Nhân viên INACTIVE giữa tháng vẫn tính VẮNG cho các ngày còn phân ca mà không có check-in
- FR-6.6: Khi mới check-in, `checkOutStatus` = NULL. **THIẾU CHECK-OUT** được suy luận (không lưu): bản ghi có `checkInTime`, chưa có `checkOutTime` và `workDate` < hôm nay. Admin bổ sung giờ ra bằng FR-9.3, hệ thống tính lại `checkOutStatus` theo FR-6.4.

**FR-7: Dashboard realtime (Admin)**
- FR-7.1: Danh sách chấm công trong ngày, cập nhật qua WebSocket khi có lượt quẹt mới
- FR-7.2: Tổng quan: số người đã chấm công / tổng số người được phân ca hôm nay, số người trễ, số người đang vắng (theo FR-6.5)
- FR-7.3: Lọc theo phòng ban

**FR-8: Báo cáo & thống kê**
- FR-8.1: Xem lịch sử chấm công theo nhân viên, theo khoảng thời gian
- FR-8.2: Thống kê số ngày theo loại (Đúng giờ / Trễ / Về sớm / Vắng / Thiếu check-out) của từng nhân viên theo tháng
- FR-8.3: Danh sách nhân viên đang vắng trong ngày hiện tại (theo FR-6.5)
- FR-8.4: Lọc báo cáo theo phòng ban

**FR-9: Quyền hạn Admin**
- FR-9.1: Xem toàn bộ dữ liệu chấm công
- FR-9.2: Quản lý phòng ban, nhân viên, ca làm việc, phân ca
- FR-9.3: **Sửa/bổ sung giờ quẹt thủ công**: sửa `checkInTime`/`checkOutTime` của bản ghi đã có (quên quẹt, lỗi thiết bị, thiếu check-out), hoặc tạo mới bản ghi cho ngày đang VẮNG. Hệ thống tự tính lại trạng thái và số phút theo FR-6; Admin không gán thẳng trạng thái. **Bắt buộc có `SHIFT_ASSIGNMENT`** cho nhân viên + ngày đó. Bản ghi được đánh dấu `isManualEdit = true` và lưu `editedByAccountId`, `editedAt`, `editReason`.
- FR-9.4: Admin tạo thêm tài khoản Admin khác (Account role ADMIN, không kèm hồ sơ Employee). Tạo Employee và tạo Admin dùng chung 1 API tạo Account, khác nhau ở có kèm hồ sơ Employee hay không theo `role`. **Admin đầu tiên** được seed sẵn lúc triển khai.

**FR-10: Tích hợp phần cứng (ESP32)**
- FR-10.1: Đọc thẻ, gửi cardCode lên Backend
- FR-10.2: Nhận lệnh LED xanh (hợp lệ) / LED đỏ (lỗi, thẻ lạ, không có ca, INACTIVE, đã đủ lượt)
- FR-10.3: OLED hiển thị khi check-in/out: họ tên, thời gian, trạng thái, không dấu tiếng Việt; khi bị từ chối hiển thị lý do ngắn; tự về màn hình chờ sau 2-3 giây
- FR-10.4: Backend ghi nhận chấm công đồng bộ trong DB rồi trả response cho ESP32; cập nhật Dashboard qua WebSocket là bất đồng bộ, lỗi WebSocket không ảnh hưởng bản ghi trong DB
- FR-10.5: ESP32 không tự tạo thời gian chấm công; `scanTime` trên OLED lấy từ `CardScanResponse`

**FR-11: Bảo mật**
- FR-11.1: cardCode không phải thông tin nhạy cảm như PIN, không cần xác thực bước 2
- FR-11.2: Mật khẩu lưu BCrypt hash
- FR-11.3: email duy nhất toàn hệ thống
- FR-11.4: `/api/v1/attendance/card-scan` chỉ nhận request có header `X-Device-API-Key` đúng với giá trị cấu hình `DEVICE_API_KEY` (biến môi trường, so sánh constant-time); JWT người dùng không thay thế Device API Key
- FR-11.5: WebSocket `/topic/attendance` chỉ Admin đã xác thực (JWT + ROLE_ADMIN) mới subscribe được
- FR-11.6: Device API Key, WiFi secret, JWT secret, mật khẩu DB không commit vào Git

**FR-12: Ghi log**
- FR-12.1: Mỗi bản ghi chấm công lưu: nhân viên, giờ check-in/out, `checkInStatus`, `checkOutStatus`, `lateMinutes`, `earlyLeaveMinutes`, `isManualEdit` và thông tin người sửa (FR-9.3)
- FR-12.2: Log quẹt thẻ lạ lưu ở `UNKNOWN_CARD_LOG`
- FR-12.3: Bản ghi chấm công không bị xóa; chỉ Admin sửa theo FR-9.3

**FR-13 (Nice-to-have, làm sau nếu còn thời gian)**
- FR-13.1: Xuất báo cáo chấm công ra Excel theo tháng
- FR-13.2: Thông báo (giả lập) khi nhân viên vắng quá số ngày quy định
- FR-13.3: Giờ ca tùy chỉnh theo ngày (override, không dùng mẫu ca)
- FR-13.4: Bảng `ATTENDANCE_AUDIT_LOG` append-only lưu before/after JSON cho mỗi lần Admin sửa tay
- FR-13.5: Nhiều đầu đọc ESP32 (bảng `DEVICE`, mỗi thiết bị 1 key riêng, cột `deviceId`)
- FR-13.6: Ép đổi mật khẩu lần đầu đăng nhập (`mustChangePassword`)
- FR-13.7: Scheduler cuối ngày chốt `MISSING_CHECKOUT` thành giá trị lưu trong DB
- FR-13.8: Xóa cứng nhân viên chưa có lịch sử chấm công

### 3. Yêu cầu phi chức năng

| Mã | Yêu cầu | Mô tả |
|---|---|---|
| NFR-1 | Bảo mật | Hash password; phân quyền Employee/Admin (RBAC); JWT stateless |
| NFR-2 | Toàn vẹn dữ liệu | Không trùng bản ghi attendance hoặc phân ca cho cùng nhân viên trong 1 ngày; ràng buộc quan trọng có cả Service validation và DB unique constraint |
| NFR-3 | Hiệu năng | Phản hồi API dưới 1 giây (LAN nội bộ) |
| NFR-4 | Realtime | Dashboard cập nhật trong 1-2 giây qua WebSocket |
| NFR-5 | Khả năng phục hồi | ESP32 mất kết nối không làm mất dữ liệu đã ghi nhận |
| NFR-6 | Cấu trúc mã | Backend layered (controller → service → repository), DTO + `@Valid`, xử lý lỗi tập trung |

### 4. Ràng buộc hệ thống

- Chỉ hoạt động trong mạng LAN nội bộ; ESP32 và server cùng mạng WiFi
- Bản hiện tại dùng 1 đầu đọc ESP32
- Mỗi thẻ từ gắn với đúng 1 nhân viên

### 5. Giả định

- Nhân viên chỉ làm 1 ca trong 1 ngày; không xử lý ca qua đêm
- Không cần xử lý hàng nghìn lượt quẹt đồng thời
- Mỗi nhân viên thuộc 1 phòng ban tại 1 thời điểm

### 6. Danh sách chức năng tổng hợp

| # | Chức năng | Thực hiện bởi |
|---|---|---|
| 1 | Quản lý phòng ban | Admin |
| 2 | Quản lý nhân viên (kể cả INACTIVE) | Admin |
| 3 | Đăng nhập, đổi mật khẩu, xem lịch sử/lịch phân ca cá nhân | Nhân viên |
| 4 | Quản lý mẫu ca + phân ca | Admin |
| 5 | Chấm công qua thẻ từ (vào/ra) | Nhân viên |
| 6 | Phân loại trạng thái (đúng giờ/trễ/về sớm/vắng/thiếu check-out) | Hệ thống |
| 7 | Dashboard realtime (lọc theo phòng ban) | Admin |
| 8 | Báo cáo & thống kê (lọc theo phòng ban) | Admin |
| 9 | Tích hợp ESP32 (đọc thẻ + LED/OLED) | Hệ thống |
| 10 | Sửa/bổ sung chấm công thủ công | Admin |
| 11 | Log thẻ lạ, cấp thẻ | Admin |

### 7. Quy tắc dữ liệu và triển khai

1. Unique DB: `ACCOUNT.email`, `EMPLOYEE.accountId`, `EMPLOYEE.employeeCode`, `EMPLOYEE.cardCode`, `SHIFT_ASSIGNMENT(employeeId, workDate)`, `ATTENDANCE_RECORD(employeeId, workDate)`.
2. cardCode được chuẩn hóa trước khi lookup và lưu, cả ở ESP32 lẫn ở Backend.
3. Tạo/cập nhật `ATTENDANCE_RECORD` chạy trong transaction; `UNIQUE(employeeId, workDate)` là chốt chặn race condition (FR-5.9).
4. Thời gian chấm công lấy từ server, timezone `Asia/Ho_Chi_Minh`.
5. WebSocket chỉ là kênh realtime; dữ liệu ban đầu và CRUD qua REST.
6. Mọi endpoint REST nằm dưới `/api/v1/...` và bọc trong `ApiResponse`, trừ `CardScanResponse` (ESP32 parse trực tiếp) và `AttendanceWebSocketMessage`.
7. Trạng thái VẮNG (FR-6.5) và THIẾU CHECK-OUT (FR-6.6) là dữ liệu suy luận, không lưu trong DB.
8. Không có Refresh Token; chỉ 1 Access Token mỗi phiên (FR-3.7).
