# Cấu trúc code ESP32 — TapTrack

Ngôn ngữ: C/C++ (Arduino) · Công cụ nạp code: Arduino IDE
Phần cứng: ESP32 + đầu đọc RFID (MFRC522) + màn hình OLED SSD1306 0.96" (I2C) + 2 LED (xanh/đỏ)

## Thư viện cần cài (Library Manager)

| Thư viện | Vai trò |
|---|---|
| `MFRC522` | Đọc đầu đọc thẻ RFID |
| `WiFi.h` | Kết nối WiFi (có sẵn khi cài board ESP32) |
| `HTTPClient.h` | Gọi API Backend (có sẵn cùng board ESP32) |
| `ArduinoJson` | Dựng/đọc JSON |
| `Adafruit_GFX` | Thư viện đồ họa nền cho OLED |
| `Adafruit_SSD1306` | Điều khiển màn hình OLED SSD1306 |

## Cấu trúc file — chia theo phần cứng (Arduino IDE tự gộp mọi `.ino`/`.h` cùng thư mục sketch)

```
taptrack_esp32/
├── taptrack_esp32.ino      (main — chỉ có setup() và loop(), điều phối gọi các module khác)
├── config.h                (API_URL, GPIO, I2C; placeholder)
├── secrets.h               (WiFi + X-Device-API-Key; gitignore, không commit secret thật)
├── wifi_manager.h          (connectWiFi())
├── rfid_reader.h           (isCardPresent(), readCardCode())
├── api_client.h            (sendCardScan(), handleResponse() — gửi X-Device-API-Key và parse JSON)
├── led_indicator.h         (showGreenLed(), showRedLed())
├── oled_display.h          (showIdleScreen(), showSuccessScreen(), showErrorScreen())
└── text_utils.h            (removeVietnameseDiacritics(), normalizeCardCode())
```

## Nội dung `taptrack_esp32.ino` sau khi tách (chỉ còn điều phối)

```cpp
#include "config.h"
#include "wifi_manager.h"
#include "rfid_reader.h"
#include "api_client.h"
#include "led_indicator.h"
#include "oled_display.h"

void setup() {
  Serial.begin(115200);
  connectWiFi();
  initRfidReader();
  initOled();
  showIdleScreen();
  initLeds();
}

void loop() {
  if (!isCardPresent()) return;
  String cardCode = readCardCode();
  String response = sendCardScan(normalizeCardCode(cardCode));
  handleResponse(response);
  delay(2500);
  showIdleScreen();
  delay(1500);
}
```

## Vì sao chọn cách chia này — dùng `.h` chứa luôn định nghĩa hàm, không tách `.h`/`.cpp` riêng

Arduino/C++ chuẩn thường tách khai báo (`.h`) và định nghĩa (`.cpp`) riêng — nhưng với quy mô 1 sketch nhỏ, cách này phát sinh thêm rắc rối (`extern` declarations, thứ tự include) không đáng cho lợi ích nhận được. Cách phổ biến trong cộng đồng Arduino: viết thẳng định nghĩa hàm trong file `.h`, Arduino IDE tự gộp lúc biên dịch — đơn giản hơn, đủ dùng cho quy mô 1 file "chính" (`taptrack_esp32.ino`) gọi tới vài file "phụ trợ theo phần cứng".


## Quy ước response từ Backend
ESP32 không tự quyết định thời gian chấm công. Backend là nguồn thời gian chuẩn và trả `scanTime` trong `CardScanResponse`, kèm `attendanceType`, `employeeName`, trạng thái và `message`.
ESP32 chỉ parse response, điều khiển LED/OLED cục bộ và hiển thị `scanTime`.

## Bảo mật thiết bị
Mỗi request chấm công gửi header `X-Device-API-Key`. Giá trị thật đặt trong `secrets.h` và file này không đưa lên Git.
