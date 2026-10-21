#include <Arduino.h>

#include "config.h"
#include "secrets.h"
#include "card_scan_result.h"
#include "rfid_reader.h"
#include "oled_display.h"
#include "led_indicator.h"
#include "wifi_manager.h"
#include "api_client.h"

// =========================================================
// CẤU HÌNH THỜI GIAN
// =========================================================

// Thời gian hiển thị kết quả trước khi quay về màn hình chờ.
static const unsigned long RESULT_DISPLAY_TIME_MS = 3000;

// Sau khi hiển thị xong, chờ thêm một khoảng ngắn để tránh
// đọc lại thẻ vẫn còn trên reader (brownout, nhiễu SPI...).
// Đây là thời gian chờ THỰC TẾ người dùng thấy — giữ ngắn.
static const unsigned long POST_DISPLAY_COOLDOWN_MS = 3000;

// Cứ mỗi khoảng này kiểm tra MFRC522 còn sống không.
static const unsigned long RFID_HEALTHCHECK_INTERVAL_MS = 3000;

// =========================================================
// BIẾN TRẠNG THÁI
// =========================================================

// Thời điểm bắt đầu cooldown (set ở CUỐI mỗi lần xử lý).
static unsigned long cooldownStartAt = 0;

// Thời điểm kiểm tra MFRC522 gần nhất.
static unsigned long lastRfidCheckAt = 0;

namespace {

bool isInCooldown() {
    return (millis() - cooldownStartAt) < POST_DISPLAY_COOLDOWN_MS;
}

// Định kỳ kiểm tra MFRC522. Nếu bị reset do brownout, khởi tạo lại.
void periodicRfidHealthCheck() {
    const unsigned long now = millis();
    if (now - lastRfidCheckAt < RFID_HEALTHCHECK_INTERVAL_MS) {
        return;
    }
    lastRfidCheckAt = now;
    ensureRfidReady();
}

// Áp LED theo lệnh backend.
void applyLed(const String& command) {
    if (command == "GREEN")      showGreenLed();
    else if (command == "RED")   showRedLed();
    else                         turnOffLeds();
}

}  // namespace

void setup() {
    Serial.begin(115200);
    delay(500);

    Serial.println();
    Serial.println("===== TAPTRACK ESP32 =====");

    initLeds();
    initOled();
    initRfid();

    Serial.println("Initializing WiFi...");
    connectWiFi();

    if (isWiFiConnected()) {
        Serial.print("WiFi connected. ESP32 IP: ");
        Serial.println(getWiFiIp());
    } else {
        Serial.println("WiFi connection failed.");
    }

    // Set mốc để không bị "cooldown" ngay khi vừa boot.
    cooldownStartAt = millis() - POST_DISPLAY_COOLDOWN_MS;
    lastRfidCheckAt = millis();

    Serial.println("TapTrack is ready.");
}

void loop() {
    // 1. Kiểm tra sức khỏe MFRC522 định kỳ.
    periodicRfidHealthCheck();

    // 2. Đang trong cooldown → không quét.
    if (isInCooldown()) {
        delay(50);
        return;
    }

    // 3. Chưa có thẻ → chờ.
    if (!isCardPresent()) {
        delay(50);
        return;
    }

    // 4. Đọc UID.
    const String cardUid = readCardUid();
    if (cardUid.isEmpty()) {
        Serial.println("[RFID] Doc UID that bai - bo qua");
        delay(200);
        return;
    }

    Serial.printf("\n===== RFID CARD SCANNED =====\nCard UID: %s\n",
                  cardUid.c_str());

    showProcessingScreen();
    turnOffLeds();

    // 5. Gửi request lên backend.
    CardScanResult result;
    const bool ok = sendCardScan(cardUid, result);

    // Debug: xác nhận backend có trả tên + giờ không.
    Serial.printf("[API] employeeName='%s'  scanTime='%s'  type='%s'\n",
                  result.employeeName.c_str(),
                  result.scanTime.c_str(),
                  result.attendanceType.c_str());
    Serial.printf("[API] ledCommand='%s'  oledMessage='%s'\n",
                  result.ledCommand.c_str(),
                  result.oledMessage.c_str());

    if (!ok) {
        Serial.printf("[SCAN] FAILED  http=%d\n", result.httpStatus);
    }

    // 6. Hiển thị kết quả.
    applyLed(result.ledCommand);
    showScanResult(result);

    // 7. Giữ kết quả trên màn hình 3s.
    delay(RESULT_DISPLAY_TIME_MS);

    // 8. Quay về màn hình chờ.
    turnOffLeds();
    showIdleScreen();

    // 9. Bắt đầu cooldown NGẮN sau khi hiển thị xong.
    cooldownStartAt = millis();
    delay(200);
}