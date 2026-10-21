#ifndef API_CLIENT_H
#define API_CLIENT_H

#include <Arduino.h>
#include "card_scan_result.h"

bool sendCardScan(
    const String& cardUid,
    CardScanResult& result
);

#endif