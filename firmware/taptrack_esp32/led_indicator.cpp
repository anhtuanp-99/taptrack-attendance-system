#include "led_indicator.h"
#include "config.h"

#include <Arduino.h>

namespace {
constexpr uint8_t GREEN_PIN = LED_GREEN_PIN;
constexpr uint8_t RED_PIN   = LED_RED_PIN;
}

void initLeds() {
    pinMode(GREEN_PIN, OUTPUT);
    pinMode(RED_PIN, OUTPUT);
    turnOffLeds();
    Serial.println("LED initialized");
}

void showGreenLed() {
    digitalWrite(GREEN_PIN, HIGH);
    digitalWrite(RED_PIN, LOW);
}

void showRedLed() {
    digitalWrite(GREEN_PIN, LOW);
    digitalWrite(RED_PIN, HIGH);
}

void turnOffLeds() {
    digitalWrite(GREEN_PIN, LOW);
    digitalWrite(RED_PIN, LOW);
}