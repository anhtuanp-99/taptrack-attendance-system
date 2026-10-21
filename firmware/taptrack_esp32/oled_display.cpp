#include "oled_display.h"
#include "config.h"
#include "text_utils.h"
#include "card_scan_result.h"

#include <Wire.h>
#include <U8g2lib.h>

// =========================================================
// PRIVATE — helper nội bộ file
// =========================================================
namespace {

U8G2_SH1106_128X64_NONAME_F_HW_I2C display(
    U8G2_R0,
    U8X8_PIN_NONE
);

void drawCentered(const String& text, int y) {
    const int textWidth = display.getStrWidth(text.c_str());
    const int x = max(0, (OLED_WIDTH - textWidth) / 2);
    display.drawStr(x, y, text.c_str());
}

String prepareText(const String& text) {
    return toUpperAscii(removeVietnameseAccents(text));
}

void splitMessage(const String& message, String& line1, String& line2) {
    const int newlineIndex = message.indexOf('\n');
    if (newlineIndex >= 0) {
        line1 = message.substring(0, newlineIndex);
        line2 = message.substring(newlineIndex + 1);
    } else {
        line1 = message;
        line2 = "";
    }
}

// Trích mẫu "HH:mm" từ chuỗi bất kỳ.
//   "2026-10-14T08:30:45"  -> "08:30"
//   "08:30 IN"             -> "08:30"
//   "The khong ton tai"    -> ""
String extractTime(const String& text) {
    if (text.isEmpty()) return "";

    for (int i = 0; i + 4 < (int)text.length(); ++i) {
        if (isDigit(text[i]) && isDigit(text[i + 1]) &&
            text[i + 2] == ':' &&
            isDigit(text[i + 3]) && isDigit(text[i + 4])) {
            return text.substring(i, i + 5);
        }
    }
    return "";
}

// 🔑 Helper dùng CHUNG cho success + error: LUÔN trả về "HH:mm" nếu có.
//   Ưu tiên: dòng 2 oledMessage (backend thường embed sẵn) -> scanTime field.
String getScanTimeForDisplay(const CardScanResult& result) {
    String msgLine1, msgLine2;
    splitMessage(result.oledMessage, msgLine1, msgLine2);

    String t = extractTime(msgLine2);
    if (!t.isEmpty()) return t;

    return extractTime(result.scanTime);
}

String formatAttendanceType(const String& type) {
    String s = type;
    s.replace("_", " ");
    return s;
}

// =========================================================
// SUCCESS — 3 tầng: TÊN / GIỜ / LOẠI
// =========================================================
void drawSuccessScreen(const CardScanResult& result) {
    String msgLine1, msgLine2;
    splitMessage(result.oledMessage, msgLine1, msgLine2);

    String nameLine = result.employeeName.isEmpty()
                          ? msgLine1
                          : result.employeeName;
    nameLine = prepareText(nameLine);

    const String timeLine = getScanTimeForDisplay(result);
    const String typeLine = prepareText(
        formatAttendanceType(result.attendanceType));

    display.clearBuffer();

    // Tầng 1: tên NV (font nhỏ nếu quá dài).
    const bool nameTooWide =
        display.getStrWidth(nameLine.c_str()) > OLED_WIDTH;
    display.setFont(nameTooWide ? u8g2_font_5x8_tr
                                 : u8g2_font_6x10_tr);
    drawCentered(nameLine, 12);

    // Tầng 2: giờ (font lớn).
    if (!timeLine.isEmpty()) {
        display.setFont(u8g2_font_ncenB10_tr);
        drawCentered(timeLine, 36);
    }

    // Tầng 3: loại chấm công.
    if (!typeLine.isEmpty()) {
        display.setFont(u8g2_font_6x10_tr);
        drawCentered(typeLine, 56);
    }

    display.sendBuffer();
}

// =========================================================
// ERROR — LUÔN hiển thị giờ
//   - Có tên NV   : TÊN / GIỜ / LỖI        (3 tầng)
//   - Không có tên: GIỜ / LỖI              (2 tầng, giờ ở trên)
// =========================================================
void drawErrorScreen(const CardScanResult& result) {
    String line1, line2;
    splitMessage(result.oledMessage, line1, line2);
    line1 = prepareText(line1);
    line2 = prepareText(line2);

    const String nameLine = prepareText(result.employeeName);
    const String timeLine = getScanTimeForDisplay(result);

    // Gộp lỗi (nếu 2 dòng) thành 1 dòng để vừa 1 tầng.
    String errLine = line1;
    if (!line2.isEmpty()) {
        errLine += " ";
        errLine += line2;
    }

    // Chọn font cho dòng lỗi — thu nhỏ nếu quá dài.
    const bool errTooWide =
        display.getStrWidth(errLine.c_str()) > OLED_WIDTH;
    const uint8_t* errFont =
        errTooWide ? u8g2_font_5x8_tr : u8g2_font_6x10_tr;

    display.clearBuffer();

    if (nameLine.isEmpty()) {
        // Không có tên (UNKNOWN_CARD, DEVICE_KEY_INVALID...):
        //   Tầng 1: GIỜ (font lớn, ở trên)
        //   Tầng 2: LỖI
        if (!timeLine.isEmpty()) {
            display.setFont(u8g2_font_ncenB10_tr);
            drawCentered(timeLine, 24);
        }

        display.setFont(errFont);
        drawCentered(errLine, 52);
    } else {
        // Có tên: 3 tầng đầy đủ.
        display.setFont(u8g2_font_6x10_tr);
        drawCentered(nameLine, 12);

        if (!timeLine.isEmpty()) {
            display.setFont(u8g2_font_ncenB10_tr);
            drawCentered(timeLine, 36);
        }

        display.setFont(errFont);
        drawCentered(errLine, 56);
    }

    display.sendBuffer();
}

}  // namespace

// =========================================================
// PUBLIC API — khớp với oled_display.h
// =========================================================

void initOled() {
    Wire.begin(OLED_SDA, OLED_SCL);
    display.begin();
    showIdleScreen();
    Serial.println("OLED initialized");
}

void showIdleScreen() {
    display.clearBuffer();
    display.setFont(u8g2_font_ncenB08_tr);
    drawCentered("TAPTRACK", 24);
    drawCentered("QUET THE RFID", 48);
    display.sendBuffer();
}

void showProcessingScreen() {
    display.clearBuffer();
    display.setFont(u8g2_font_ncenB08_tr);
    drawCentered("TAPTRACK", 24);
    drawCentered("DANG XU LY...", 48);
    display.sendBuffer();
}

void showScanResult(const CardScanResult& result) {
    if (result.success) {
        drawSuccessScreen(result);
    } else {
        drawErrorScreen(result);
    }
}