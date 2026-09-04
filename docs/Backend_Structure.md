# Cấu trúc Backend — TapTrack

Package gốc: `com.taptrack`

```
com.taptrack
├── TapTrackApplication.java
│
├── entity/
│   ├── Account.java
│   ├── RefreshToken.java
│   ├── Department.java
│   ├── Employee.java
│   ├── ShiftTemplate.java
│   ├── ShiftAssignment.java
│   ├── AttendanceRecord.java
│   └── UnknownCardLog.java
│
├── enums/
│   ├── Role.java                         (EMPLOYEE, ADMIN)
│   ├── EmploymentStatus.java             (ACTIVE, INACTIVE)
│   ├── CheckInStatus.java                (ON_TIME, LATE)
│   ├── CheckOutStatus.java                (ON_TIME, EARLY_LEAVE, MISSING_CHECKOUT)
│   ├── AttendanceType.java               (CHECK_IN, CHECK_OUT — dùng ở CardScanResponse.result)
│   ├── LedCommand.java                   (GREEN, RED)
│   └── DayScheduleStatus.java            (SHIFT, OFF — dùng ở lịch phân ca theo tuần)
│
├── repository/
│   ├── AccountRepository.java
│   ├── RefreshTokenRepository.java       (findByTokenHashAndRevokedFalse, deleteByAccountId)
│   ├── DepartmentRepository.java
│   ├── EmployeeRepository.java           (findAll(Specification, Pageable) — lọc departmentId/employmentStatus + phân trang; countGroupedByDepartment tránh N+1)
│   ├── ShiftTemplateRepository.java
│   ├── ShiftAssignmentRepository.java
│   ├── AttendanceRecordRepository.java   (findByEmployeeIdAndWorkDateBetween(..., Pageable))
│   └── UnknownCardLogRepository.java
│
├── service/
│   ├── AuthService.java                  (đăng nhập + đổi mật khẩu + làm mới token + đăng xuất)
│   ├── AccountService.java               (tạo Account chung + reset mật khẩu)
│   ├── DepartmentService.java
│   ├── EmployeeService.java              (bao gồm sửa thông tin nhân viên)
│   ├── ShiftService.java                 (bao gồm sửa/xóa ShiftAssignment, chặn xóa ShiftTemplate đang dùng)
│   ├── AttendanceService.java
│   └── ReportService.java
│
├── mapper/
│   ├── DepartmentMapper.java
│   ├── EmployeeMapper.java
│   ├── ShiftMapper.java
│   ├── AttendanceMapper.java
│   └── ReportMapper.java
│
├── controller/
│   ├── AuthController.java
│   ├── AttendanceController.java         (ESP32 gọi vào đây; yêu cầu X-Device-API-Key)
│   ├── admin/
│   │   ├── AccountController.java        (/api/admin/accounts — tạo Employee/Admin)
│   │   ├── DepartmentController.java
│   │   ├── EmployeeController.java       (GET/PUT/DELETE)
│   │   ├── ShiftController.java
│   │   ├── DashboardController.java
│   │   ├── ReportController.java
│   │   ├── AdminAttendanceController.java     (Admin xem/sửa/bổ sung attendance thủ công)
│   │   └── UnknownCardController.java         (Admin lấy danh sách UNKNOWN_CARD gần nhất để cấp thẻ)
│   ├── employee/
│   │   └── MyAttendanceController.java   (/api/employee/my-attendance, /api/employee/my-schedule/week)
│   └── websocket/
│       └── AttendanceWebSocketConfig.java
│
├── dto/
│   ├── request/
│   │   ├── LoginRequest.java
│   │   ├── RefreshTokenRequest.java
│   │   ├── LogoutRequest.java
│   │   ├── DepartmentRequest.java
│   │   ├── AccountCreateRequest.java      (dùng chung Employee/Admin — có field role + employeeProfile lồng)
│   │   ├── EmployeeProfileRequest.java    (object lồng trong AccountCreateRequest khi role=EMPLOYEE)
│   │   ├── ChangePasswordRequest.java
│   │   ├── ResetPasswordRequest.java
│   │   ├── EmployeeUpdateRequest.java
│   │   ├── ShiftTemplateRequest.java
│   │   ├── ShiftAssignmentRequest.java    (dùng chung tạo mới và sửa; validate template/custom-time)
│   │   ├── CardScanRequest.java
│   │   └── AttendanceManualEditRequest.java
│   │
│   └── response/
│       ├── ApiResponse.java                       (generic wrapper: success, message, errorCode, data<T> — dùng cho mọi response REST)
│       ├── PageResponse.java                      (generic: content<T>, page, size, totalElements, totalPages)
│       ├── LoginResponse.java                     (accessToken, refreshToken, role, accessTokenExpiresIn, refreshTokenExpiresIn)
│       ├── RefreshTokenResponse.java              (accessToken, accessTokenExpiresIn)
│       ├── AccountResponse.java                   (kết quả tạo tài khoản — dùng chung Employee/Admin)
│       ├── DepartmentResponse.java
│       ├── EmployeeResponse.java
│       ├── EmployeeDeleteResponse.java
│       ├── ShiftTemplateResponse.java
│       ├── ShiftAssignmentResponse.java
│       ├── WeeklyScheduleResponse.java             (weekStart, days: List<DayScheduleItem>)
│       ├── DayScheduleItem.java                    (date, status, shiftName?, startTime?, endTime?)
│       ├── CardScanResponse.java
│       ├── AttendanceWebSocketMessage.java         (KHÔNG bọc ApiResponse — payload thuần cho /topic/attendance)
│       ├── DashboardTodayResponse.java
│       ├── AttendanceSummaryItem.java
│       ├── MonthlyReportResponse.java
│       ├── AbsentEmployeeResponse.java
│       ├── AttendanceManualEditResponse.java
│       ├── UnknownCardResponse.java
│       └── MyAttendanceResponse.java
│
├── security/
│   ├── SecurityConfig.java               (khai báo SecurityFilterChain)
│   ├── JwtTokenProvider.java             (sinh/giải mã JWT)
│   ├── JwtAuthFilter.java                (đọc header, set SecurityContext nếu token hợp lệ)
│   ├── DeviceApiKeyFilter.java                (xác thực X-Device-API-Key cho endpoint ESP32)
│   ├── JwtAuthenticationEntryPoint.java  (xử lý 401 khi thiếu/sai token)
│   ├── JwtAccessDeniedHandler.java       (xử lý 403 khi đủ xác thực nhưng không đủ quyền)
│   ├── UserPrincipal.java                (wrapper Account, implements UserDetails)
│   ├── CustomUserDetailsService.java     (tra Account theo email, bọc vào UserPrincipal)
│   └── WebSocketAuthInterceptor.java     (xác thực JWT + ROLE_ADMIN khi CONNECT/SUBSCRIBE)
│
├── exception/
│   ├── ErrorCode.java                     (enum — mỗi giá trị gắn sẵn HttpStatus + message mặc định, khớp bảng errorCode trong API Spec)
│   ├── AppException.java                  (1 class dùng chung cho mọi lỗi nghiệp vụ, mang ErrorCode + extraData tùy chọn)
│   └── GlobalExceptionHandler.java        (@RestControllerAdvice, bắt AppException + lỗi validation + lỗi không lường trước)
│
└── config/
    ├── AsyncConfig.java
    └── SwaggerConfig.java

src/main/resources/
├── static/                       (Frontend HTML/CSS/JS thuần)
├── application.properties        (cấu hình chung, dùng placeholder, không chứa mật khẩu thật)
├── application-dev.properties
├── application-local.properties  (mật khẩu DB/JWT secret thật — gitignore)
├── application-prod.properties
├── logback-spring.xml
└── data.sql                      (seed 1 Account role ADMIN)

src/test/java/com/taptrack/
├── service/
│   ├── AttendanceServiceTest.java
│   └── AccountServiceTest.java
└── controller/
    └── AttendanceControllerTest.java
```


## Business invariants cần enforce cả Service lẫn Database
- `ACCOUNT.email` duy nhất.
- `EMPLOYEE.accountId` duy nhất (1 Account ↔ tối đa 1 Employee).
- `EMPLOYEE.cardCode` duy nhất sau khi normalize (trim + uppercase, loại khoảng trắng/phân cách không cần thiết).
- `EMPLOYEE.employeeCode` duy nhất.
- `SHIFT_ASSIGNMENT(employeeId, workDate)` duy nhất.
- `ATTENDANCE_RECORD(employeeId, workDate)` duy nhất.
- Một `SHIFT_ASSIGNMENT` phải dùng **một trong hai**: `shiftTemplateId` hoặc cặp `customStartTime + customEndTime`; không được thiếu cả hai hoặc dùng đồng thời.
- Giờ kết thúc phải sau giờ bắt đầu; không hỗ trợ ca qua ngày.
- Nếu một `SHIFT_ASSIGNMENT` đã có `ATTENDANCE_RECORD`, không được UPDATE/DELETE assignment.
- Nhân viên `INACTIVE` không được chấm công và không được tạo phân ca mới.
- Endpoint ESP32 chỉ nhận request có `X-Device-API-Key` hợp lệ; JWT người dùng không được dùng thay thế.
- WebSocket `/topic/attendance` chỉ cho Admin đã xác thực.
- Manual attendance create/update luôn ghi `AttendanceAuditLog`; audit log append-only.
