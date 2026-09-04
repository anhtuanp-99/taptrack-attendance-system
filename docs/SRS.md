# SRS — Đặc tả yêu cầu phần mềm
## Hệ thống Chấm công ứng dụng ESP32 và Spring Boot

*(v5 — chốt bảo mật Device API-Key, khóa phân ca sau attendance, audit thủ công, backend-time cho OLED, và đồng bộ WebSocket/REST)*

### 1. Giới thiệu

**1.1 Mục đích**
Xây dựng hệ thống chấm công nhân viên theo ca làm việc, kết hợp Web Service (Spring Boot) làm trọng tâm và IoT (ESP32) làm phần đọc thẻ từ tại điểm chấm công.

**1.2 Phạm vi**
Hệ thống cho phép nhân viên quẹt thẻ từ để chấm công vào/ra, tự động đối chiếu với ca làm việc được phân công để xác định trạng thái vào ca (Đúng giờ / Trễ) và trạng thái ra ca (Đúng giờ / Về sớm) một cách độc lập, hoặc đánh dấu cả ngày là Vắng nếu không có bản ghi nào. Nhân viên có thể đăng nhập để xem lịch sử chấm công cá nhân. Admin (HR) quản lý phòng ban, nhân viên, ca làm việc, phân ca, theo dõi chấm công realtime và xem báo cáo thống kê — có thể lọc theo phòng ban.

**1.3 Đối tượng sử dụng (Actors)**

| Actor | Mô tả |
|---|---|
| Nhân viên (Employee) | Quẹt thẻ chấm công vào/ra tại đầu đọc ESP32; đăng nhập web bằng email/password để xem lịch sử chấm công cá nhân |
| Quản trị viên (Admin/HR) | Quản lý phòng ban, nhân viên, ca làm việc, phân ca, xem báo cáo, dashboard |
| Hệ thống phần cứng (ESP32) | Đọc thẻ từ tại 1 điểm chấm công duy nhất, nhận lệnh phản hồi LED |

### 2. Yêu cầu chức năng (Functional Requirements)

**FR-1: Quản lý phòng ban**
- FR-1.1: Admin tạo/sửa/xóa danh mục phòng ban (Department) — ví dụ "Backend", "Frontend", "QA", "HR"
- FR-1.2: Không cho xóa phòng ban nếu đang có nhân viên thuộc phòng ban đó

**FR-2: Quản lý nhân viên**
- FR-2.1: Chỉ Admin có quyền tạo/sửa/xóa hồ sơ nhân viên
- FR-2.2: Khi tạo nhân viên: nhập họ tên (lưu ở Account, dùng chung mọi role), mã nhân viên, cấp cardCode (gắn với thẻ từ), chọn phòng ban (từ danh mục FR-1), nhập chức danh (job title — text tự do, chỉ mang tính mô tả, không dùng để phân quyền); đồng thời hệ thống tạo 1 Account liên kết (email, mật khẩu ban đầu do Admin đặt, role = EMPLOYEE — xem thêm FR-3)
- FR-2.3: cardCode phải duy nhất sau khi chuẩn hóa (trim, uppercase, loại khoảng trắng/ký tự phân cách không cần thiết)
- FR-2.4: Nhân viên không có chức năng tự đăng ký (Admin tạo tài khoản, xem thêm FR-3)
- FR-2.5: Admin có thể sửa thông tin nhân viên đã tạo: họ tên, phòng ban (chuyển phòng ban), chức danh, cấp lại cardCode mới (trường hợp mất thẻ) — không cho đổi cardCode trùng với thẻ của nhân viên khác; khi cập nhật cardCode phải áp dụng cùng quy tắc chuẩn hóa như FR-2.3
- FR-2.6: Nhân viên nghỉ việc:
  - Nếu **chưa từng có bản ghi chấm công** (chưa từng có lượt quẹt thẻ thật nào — các ngày bị suy luận là VẮNG theo FR-6.5 không tính, vì không phải bản ghi thật) → Admin xóa cứng (hard delete) hồ sơ nhân viên, bao gồm cả **Account liên kết** (FR-3.1); đồng thời **xóa cascade toàn bộ bản ghi phân ca** (FR-4.4) đã gán cho nhân viên này — cả quá khứ lẫn tương lai, vì nhân viên đã bị xóa hẳn khỏi hệ thống nên giữ lại phân ca cũ không còn ý nghĩa, tránh dữ liệu mồ côi
  - Nếu **đã có lịch sử chấm công** → chặn xóa, chỉ cho chuyển status = INACTIVE để bảo toàn dữ liệu báo cáo cũ
  - Nhân viên INACTIVE không thể chấm công (ESP32 từ chối, LED đỏ) và Account liên kết không thể đăng nhập

**FR-3: Đăng nhập & phân quyền**
- FR-3.1: Hệ thống dùng **1 bảng Account chung** (email, mật khẩu đã hash, role) cho cả Admin và Nhân viên — không tách riêng 2 cơ chế đăng nhập, chỉ khác nhau ở giá trị `role` (`EMPLOYEE`/`ADMIN`)
- FR-3.2: Khi Admin tạo nhân viên (FR-2.2), hệ thống tự tạo 1 Account liên kết với role = EMPLOYEE; Account của Admin được khởi tạo sẵn với role = ADMIN
- FR-3.3: Người dùng đăng nhập qua **1 cổng chung** bằng email + password; hệ thống tự xác định `role` từ Account và điều hướng đến giao diện tương ứng (Employee Portal hoặc Admin Dashboard)
- FR-3.4: Sau đăng nhập, tài khoản role EMPLOYEE chỉ xem được lịch sử chấm công của **chính mình** — không xem được dữ liệu nhân viên khác, không có quyền sửa/xóa bất kỳ dữ liệu nào, không truy cập được các chức năng quản trị (phòng ban, ca làm việc, phân ca, báo cáo toàn công ty)
- FR-3.5: Người dùng đã đăng nhập (bất kỳ role nào) có thể tự đổi mật khẩu — phải nhập đúng mật khẩu cũ trước khi đặt mật khẩu mới
- FR-3.6: Admin có thể đặt lại mật khẩu cho bất kỳ Account nào (Employee hoặc Admin khác) khi người dùng quên mật khẩu — không cần biết mật khẩu cũ
- FR-3.7: Nhân viên (role EMPLOYEE) xem được lịch phân ca của **chính mình** theo tuần (Thứ 2 → Chủ nhật), cùng định dạng hiển thị NGHỈ/có ca như Admin xem (FR-4.7) — không xem được lịch của nhân viên khác
- FR-3.8: Khi đăng nhập thành công, hệ thống cấp đồng thời **Access Token** (thời hạn ngắn, dùng cho mọi request) và **Refresh Token** (thời hạn dài hơn, lưu trong DB, dùng để xin cấp Access Token mới khi hết hạn mà không cần đăng nhập lại)
- FR-3.9: Người dùng có thể đăng xuất — thu hồi (revoke) Refresh Token đang dùng, sau đó Refresh Token đó không thể dùng để xin cấp Access Token mới nữa

**FR-4: Quản lý ca làm việc**
- FR-4.1: Admin tạo trước các **mẫu ca cố định** (shift template) — ví dụ "Ca sáng" (8h-12h), "Ca chiều" (13h-17h) — dùng lại nhiều ngày
- FR-4.2: Khi phân ca cho nhân viên theo ngày, Admin có thể chọn 1 mẫu ca có sẵn, **hoặc** nhập giờ bắt đầu/kết thúc tùy chỉnh riêng cho ngày đó (override, không sửa mẫu gốc)
- FR-4.3: Grace period (số phút cho phép trễ) là **1 giá trị cố định áp dụng chung toàn hệ thống**, cấu hình tại 1 nơi (không cấu hình riêng theo từng ca)
- FR-4.4: Admin phân ca cho từng nhân viên theo ngày cụ thể (lịch làm việc)
- FR-4.5: 1 nhân viên trong 1 ngày chỉ thuộc 1 ca (không xử lý ca chồng lấn)
- FR-4.6: Ngày nào nhân viên **không được phân ca** → hệ thống hiển thị rõ trạng thái **NGHỈ** khi xem lịch (không để trống/im lặng) — phân biệt rõ với ngày chưa nhập lịch, tránh nhầm lẫn khi đọc báo cáo
- FR-4.7: Admin xem lịch phân ca của 1 nhân viên theo **tuần** (Thứ 2 → Chủ nhật), mỗi ngày hiển thị 1 trong 2 trạng thái: có ca (kèm tên ca/giờ) hoặc NGHỈ
- FR-4.8: Admin có thể sửa hoặc xóa 1 phân ca đã tạo **chỉ khi chưa có bất kỳ bản ghi chấm công thật nào cho nhân viên + ngày đó**. Khi đã có `ATTENDANCE_RECORD`, phân ca bị khóa để không làm thay đổi căn cứ tính trạng thái đã ghi nhận. Quy tắc này áp dụng cả ngày hôm nay.
- FR-4.9: Không cho xóa 1 mẫu ca (`ShiftTemplate`) nếu đang có phân ca nào tham chiếu tới nó

**FR-5: Chấm công qua thẻ từ**
- FR-5.1: Nhân viên quẹt thẻ từ qua đầu đọc gắn với ESP32
- FR-5.2: ESP32 đọc cardCode, gửi lên Backend qua HTTP POST
- FR-5.3: Backend xác định đây là chấm công **vào ca** hay **ra ca** dựa trên: nếu chưa có bản ghi check-in trong ngày → check-in; nếu đã có check-in nhưng chưa check-out → check-out
- FR-5.4: Mỗi nhân viên chỉ có tối đa 1 lần check-in và 1 lần check-out hợp lệ trong 1 ngày
- FR-5.5: Backend trả kết quả tức thời cho ESP32 để hiển thị LED; response phải chứa `scanTime` do Backend tạo, để OLED dùng cùng một nguồn thời gian chuẩn
- FR-5.6: cardCode không khớp bất kỳ nhân viên nào trong hệ thống (thẻ lạ) → Backend từ chối, **không tạo bản ghi chấm công**, ghi log riêng loại `UNKNOWN_CARD` (kèm cardCode, thời gian) để Admin phát hiện bất thường; ESP32 nhận lệnh LED đỏ
- FR-5.7: Nhân viên quẹt thẻ lần thứ 3 trở lên trong cùng 1 ngày (đã có đủ 1 check-in + 1 check-out) → Backend từ chối, giữ nguyên check-out đã ghi nhận trước đó, không ghi đè; ESP32 nhận lệnh LED đỏ. Trường hợp cần sửa giờ chấm công thật, thực hiện qua kênh chính thức FR-9.3 (Admin sửa tay), không qua ESP32
- FR-5.8: Nhân viên quẹt thẻ nhưng không được phân ca trong ngày đó → Backend từ chối, trả lỗi, không tạo bản ghi chấm công; ESP32 nhận lệnh LED đỏ

**FR-6: Phân loại trạng thái chấm công**
- FR-6.1: Mỗi bản ghi chấm công có **2 cờ trạng thái độc lập**: `checkInStatus` (dựa trên giờ vào) và `checkOutStatus` (dựa trên giờ ra) — không gộp chung thành 1 trạng thái duy nhất, vì 1 nhân viên có thể vừa Trễ (vào ca) vừa Về sớm (ra ca) trong cùng 1 ngày
- FR-6.2: Check-in trước hoặc trong khoảng grace period (giá trị cố định toàn hệ thống, FR-4.3) tính từ giờ bắt đầu ca → `checkInStatus` = **ĐÚNG GIỜ**
- FR-6.3: Check-in sau grace period → `checkInStatus` = **TRỄ**, ghi nhận số phút trễ
- FR-6.4: Check-out trước giờ kết thúc ca (dù chỉ sớm 1 phút, không áp dụng grace period cho trường hợp này) → `checkOutStatus` = **VỀ SỚM**, ghi nhận số phút về sớm; ngược lại → `checkOutStatus` = **ĐÚNG GIỜ**
- FR-6.5: **VẮNG không tạo bản ghi riêng trong dữ liệu** — được suy luận khi cần (dashboard, báo cáo) bằng cách so sánh danh sách nhân viên được phân ca trong ngày với danh sách đã có check-in; nếu 1 nhân viên có ca nhưng không có check-in → hiển thị là **VẮNG**
- FR-6.6: Cuối ngày, nhân viên có check-in nhưng không có check-out → `checkOutStatus` = **THIẾU CHECK-OUT** (giữ nguyên `checkInStatus` đã tính từ lúc vào ca) — chờ Admin bổ sung thủ công theo FR-9.3, khi bổ sung xong hệ thống tính lại `checkOutStatus` theo FR-6.4

**FR-7: Dashboard realtime (Admin)**
- FR-7.1: Danh sách chấm công realtime trong ngày, cập nhật qua WebSocket khi có nhân viên quẹt thẻ mới
- FR-7.2: Hiển thị tổng quan: số người đã chấm công / tổng số người được phân ca hôm nay, số người trễ
- FR-7.3: Cho phép lọc danh sách theo phòng ban

**FR-8: Báo cáo & thống kê**
- FR-8.1: Xem lịch sử chấm công theo nhân viên, theo khoảng thời gian
- FR-8.2: Thống kê tổng số ngày theo từng loại (Đúng giờ / Trễ / Về sớm / Vắng / Thiếu check-out) của từng nhân viên theo tháng
- FR-8.3: Xem danh sách nhân viên vắng trong ngày hiện tại
- FR-8.4: Cho phép lọc báo cáo theo phòng ban

**FR-9: Quyền hạn Admin**
- FR-9.1: Xem toàn bộ dữ liệu chấm công của mọi nhân viên
- FR-9.2: Quản lý phòng ban, nhân viên, ca làm việc, lịch phân ca
- FR-9.3: Admin có thể bổ sung/sửa thủ công **giờ quẹt (check-in/check-out)** của 1 bản ghi chấm công đã tồn tại (trường hợp quên quẹt thẻ, lỗi thiết bị, hoặc bản ghi đang ở trạng thái THIẾU CHECK-OUT), **hoặc tạo mới hoàn toàn** bản ghi check-in + check-out cho 1 ngày đang bị đánh dấu VẮNG (trường hợp nhân viên có đi làm thật nhưng quên quẹt cả 2 lượt) — trong cả 2 trường hợp, hệ thống tự động tính lại `checkInStatus`/`checkOutStatus` tương ứng dựa trên giờ mới nhập, áp dụng đúng logic FR-6, không cho phép Admin gán thẳng trạng thái mà không qua giờ quẹt. Hành động này được ghi log riêng để phân biệt với chấm công tự động
- FR-9.4: Admin có thể tạo thêm tài khoản Admin khác (nhập họ tên, email, mật khẩu ban đầu — tạo trực tiếp 1 Account với role = ADMIN, không cần hồ sơ Employee đi kèm). Về mặt kỹ thuật, việc tạo tài khoản Employee (FR-2.2) và tạo tài khoản Admin dùng chung 1 cơ chế "tạo Account" — chỉ khác nhau ở việc có kèm hồ sơ Employee hay không, tùy theo `role` được chọn. Riêng **Admin đầu tiên** của hệ thống không có ai tạo trước, nên được khởi tạo sẵn qua dữ liệu seed lúc triển khai (nằm ngoài phạm vi thao tác qua giao diện)

**FR-10: Tích hợp phần cứng (ESP32)**
- FR-10.1: Đọc thẻ từ, gửi cardCode lên Backend
- FR-10.2: Nhận lệnh: LED xanh (chấm công hợp lệ) / LED đỏ (lỗi, thẻ lạ, hoặc không có ca hôm nay)
- FR-10.3: Hiển thị màn hình OLED thông tin cơ bản khi check-in/check-out: họ tên nhân viên, thời gian, trạng thái (đúng giờ/trễ/về sớm) — không dấu tiếng Việt; khi bị từ chối (thẻ lạ, không có ca, đã đủ lượt, tài khoản INACTIVE) hiển thị lý do tương ứng; tự động quay về màn hình chờ sau 2-3 giây
- FR-10.4: Backend ghi nhận chấm công đồng bộ trong Database rồi trả response cho ESP32; WebSocket cập nhật Dashboard là bất đồng bộ. Lỗi kết nối tới WebSocket/Admin Dashboard không ảnh hưởng tới bản ghi Database.
- FR-10.5: ESP32 không tự tạo thời gian chấm công; `scanTime` hiển thị OLED lấy từ `CardScanResponse` của Backend.

**FR-11: Bảo mật**
- FR-11.1: cardCode không phải thông tin nhạy cảm như PIN — không yêu cầu xác thực thêm bước 2 khi chấm công
- FR-11.2: Mật khẩu trong Account (áp dụng chung cho mọi role) lưu dạng hash BCrypt, không lưu plaintext
- FR-11.3: email trong Account phải duy nhất trong toàn hệ thống
- FR-11.4: Endpoint `/api/attendance/card-scan` chỉ chấp nhận request có header `X-Device-API-Key` hợp lệ; JWT người dùng không thay thế Device API-Key.
- FR-11.5: WebSocket `/topic/attendance` chỉ cho phép Admin đã xác thực và được phân quyền subscribe.
- FR-11.6: Secret WiFi/Device API-Key của ESP32 không lưu trong file cấu hình được commit vào Git.

**FR-12: Ghi log & Audit**
- FR-12.1: Mọi bản ghi chấm công lưu: nhân viên, thời gian check-in/check-out, `checkInStatus` và `checkOutStatus` (2 trạng thái độc lập, FR-6.1), có phải do Admin sửa tay hay không
- FR-12.2: Log không được xóa sau khi ghi, chỉ có thể thêm bản ghi điều chỉnh liên kết tới bản ghi gốc
- FR-12.3: Log riêng cho các lượt quẹt thẻ lạ (`UNKNOWN_CARD`, FR-5.6)
- FR-12.4: Mỗi lần Admin tạo/sửa attendance thủ công phải tạo `ATTENDANCE_AUDIT_LOG` append-only, lưu Admin thực hiện, thời gian, hành động, giá trị trước/sau và lý do nếu có.

**FR-13 (Nice-to-have)**
- FR-13.1: Xuất báo cáo chấm công ra Excel theo tháng
- FR-13.2: Thông báo (giả lập) khi nhân viên vắng quá số ngày quy định trong tháng

### 3. Yêu cầu phi chức năng (Non-functional Requirements)

| Mã | Yêu cầu | Mô tả |
|---|---|---|
| NFR-1 | Bảo mật | Hash password Admin và Employee; phân quyền Employee/Admin (RBAC) |
| NFR-2 | Toàn vẹn dữ liệu | Không tạo trùng bản ghi attendance hoặc phân ca cho cùng 1 nhân viên trong 1 ngày; các ràng buộc quan trọng phải có cả Service validation và DB unique constraint |
| NFR-3 | Hiệu năng | Phản hồi API dưới 1 giây (LAN nội bộ) |
| NFR-4 | Khả năng mở rộng | Kiến trúc 4-layer, thiết kế cho phép mở rộng nhiều đầu đọc ESP32 trong tương lai dù bản hiện tại chỉ dùng 1 |
| NFR-5 | Realtime | Admin Dashboard cập nhật trong 1-2 giây qua WebSocket |
| NFR-6 | Khả năng phục hồi | ESP32 mất kết nối không làm mất dữ liệu chấm công đã ghi nhận trước đó |

### 4. Ràng buộc hệ thống (Constraints)

- Chỉ hoạt động trong mạng LAN nội bộ
- ESP32 và server cùng mạng WiFi
- Hệ thống dùng **1 đầu đọc ESP32 duy nhất** đặt tại 1 điểm chấm công
- Mỗi thẻ từ gắn với đúng 1 nhân viên

### 5. Giả định (Assumptions)

- Nhân viên chỉ làm 1 ca trong 1 ngày
- Không xử lý ca qua đêm (ca kết thúc sau 0h ngày hôm sau) ở phiên bản này
- Không cần xử lý hàng nghìn lượt quẹt đồng thời
- Mỗi nhân viên chỉ thuộc 1 phòng ban tại 1 thời điểm

### 6. Danh sách chức năng tổng hợp

| # | Chức năng | Thực hiện bởi |
|---|---|---|
| 1 | Quản lý phòng ban | Admin |
| 2 | Quản lý nhân viên | Admin |
| 3 | Đăng nhập & xem lịch sử cá nhân | Nhân viên |
| 4 | Quản lý ca làm việc + phân ca | Admin |
| 5 | Chấm công qua thẻ từ (vào/ra) | Nhân viên |
| 6 | Phân loại trạng thái (đúng giờ/trễ/về sớm/vắng) | Hệ thống |
| 7 | Dashboard realtime (lọc theo phòng ban) | Admin |
| 8 | Báo cáo & thống kê (lọc theo phòng ban) | Admin |
| 9 | Tích hợp ESP32 (đọc thẻ + LED) | Hệ thống |
| 10 | Ghi log & Audit (bao gồm thẻ lạ) | Hệ thống |
| 11 | Xuất Excel | Admin (Nice-to-have) |
| 12 | Thông báo vắng quá hạn | Hệ thống (Nice-to-have) |


### 7. Quy tắc dữ liệu và triển khai bắt buộc (v5)
1. Unique DB: `ACCOUNT.email`, `EMPLOYEE.accountId`, `EMPLOYEE.employeeCode`, `EMPLOYEE.cardCode`, `SHIFT_ASSIGNMENT(employeeId, workDate)`, `ATTENDANCE_RECORD(employeeId, workDate)`.
2. `SHIFT_ASSIGNMENT`: hoặc `shiftTemplateId`, hoặc `customStartTime + customEndTime`; không cho cả hai trạng thái sai. `endTime > startTime`.
3. CardCode được canonicalize trước khi lookup và lưu.
4. `ATTENDANCE_RECORD` create/update phải transactional.
5. Chốt `MISSING_CHECKOUT`: Scheduler cuối ngày + cơ chế recovery khi hệ thống bỏ lỡ job sau restart.
6. WebSocket chỉ là kênh realtime; dữ liệu ban đầu/CRUD vẫn qua REST.
