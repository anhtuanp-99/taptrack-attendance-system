#include "wifi_manager.h"
#include "secrets.h"

#include <WiFi.h>

namespace {
constexpr unsigned long WIFI_TIMEOUT_MS = 15000;
}

bool connectWiFi() {
    Serial.printf("\nConnecting to WiFi: %s\n", WIFI_SSID);

    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
    const unsigned long startTime = millis();

    while (WiFi.status() != WL_CONNECTED) {
        if (millis() - startTime >= WIFI_TIMEOUT_MS) {
            Serial.println("\nWiFi connection timeout");
            return false;
        }
        delay(500);
        Serial.print(".");
    }

    Serial.printf("\nWiFi connected. IP: %s\n",
                  WiFi.localIP().toString().c_str());
    return true;
}

bool isWiFiConnected() {
    return WiFi.status() == WL_CONNECTED;
}

String getWiFiIp() {
    return WiFi.localIP().toString();
}