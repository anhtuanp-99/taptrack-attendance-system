#include "api_client.h"
#include "config.h"
#include "secrets.h"
#include "wifi_manager.h"

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

namespace {

constexpr int HTTP_TIMEOUT_MS = 10000;

// Lỗi mạng / parse — backend không trả về gì.
void setTransportError(CardScanResult& result,
                       const String& message,
                       const String& oledFallback) {
    result.success = false;
    result.errorMessage = message;
    result.ledCommand = "RED";
    result.oledMessage = oledFallback;
}

// Parse body JSON trực tiếp từ root (backend không bọc `data`).
void fillFromBody(const JsonDocument& doc, CardScanResult& result) {
    result.employeeId     = doc["employeeId"] | 0L;
    result.employeeName   = doc["employeeName"] | "";
    result.scanTime       = doc["scanTime"] | "";
    result.attendanceType = doc["attendanceType"] | "";
    result.checkInStatus  = doc["checkInStatus"] | "";
    result.checkOutStatus = doc["checkOutStatus"] | "";
    result.ledCommand     = doc["ledCommand"] | "";
    result.oledMessage    = doc["oledMessage"] | "";
}

}  // namespace

bool sendCardScan(const String& cardUid, CardScanResult& result) {
    result = CardScanResult();

    if (!isWiFiConnected()) {
        setTransportError(result,
                          "WiFi is not connected",
                          "MAT KET NOI\nWIFI");
        Serial.println("[API] Cancelled: WiFi not connected");
        return false;
    }

    const String url = String(BACKEND_BASE_URL) + CARD_SCAN_ENDPOINT;
    Serial.printf("[API] POST %s\n", url.c_str());

    HTTPClient http;
    if (!http.begin(url)) {
        setTransportError(result,
                          "Cannot initialize HTTP",
                          "LOI KET NOI\nTHU LAI");
        return false;
    }

    http.setTimeout(HTTP_TIMEOUT_MS);
    http.addHeader("Content-Type", "application/json");
    http.addHeader("X-Device-API-Key", DEVICE_API_KEY);

    JsonDocument requestDoc;
    requestDoc["cardCode"] = cardUid;

    String requestBody;
    serializeJson(requestDoc, requestBody);

    const int httpCode = http.POST(requestBody);
    const String responseBody = http.getString();
    http.end();

    result.httpStatus = httpCode;
    Serial.printf("[API] HTTP %d\n", httpCode);

    if (httpCode <= 0) {
        setTransportError(result,
                          http.errorToString(httpCode),
                          "LOI KET NOI\nTHU LAI");
        Serial.printf("[API] HTTP error: %s\n", result.errorMessage.c_str());
        return false;
    }

    JsonDocument doc;
    const DeserializationError parseError = deserializeJson(doc, responseBody);

    if (parseError) {
        setTransportError(result,
                          String("JSON parse error: ") + parseError.c_str(),
                          "LOI DU LIEU\nTHU LAI");
        Serial.printf("[API] JSON parse error: %s\n", parseError.c_str());
        return false;
    }

    // Backend trả cùng cấu trúc cho cả success lẫn error.
    fillFromBody(doc, result);

    // Fallback nếu backend thiếu field (tránh OLED trắng).
    if (result.ledCommand.isEmpty()) {
        result.ledCommand = (httpCode >= 200 && httpCode < 300) ? "GREEN" : "RED";
    }
    if (result.oledMessage.isEmpty()) {
        result.oledMessage = (httpCode >= 200 && httpCode < 300)
                                 ? "THANH CONG"
                                 : "LOI KET NOI\nTHU LAI";
    }

    const bool ok = (httpCode >= 200 && httpCode < 300);
    result.success = ok;

    if (ok) {
        Serial.printf("[API] OK  name=%s  type=%s  led=%s\n",
                      result.employeeName.c_str(),
                      result.attendanceType.c_str(),
                      result.ledCommand.c_str());
    } else {
        Serial.printf("[API] Backend error (HTTP %d): %s\n",
                      httpCode,
                      result.oledMessage.c_str());
    }

    return ok;
}