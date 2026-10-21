#ifndef OLED_DISPLAY_H
#define OLED_DISPLAY_H

#include <Arduino.h>
#include "card_scan_result.h"

void initOled();

void showIdleScreen();

void showProcessingScreen();

void showScanResult(
    const CardScanResult& result
);

#endif