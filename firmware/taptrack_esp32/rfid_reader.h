#ifndef RFID_READER_H
#define RFID_READER_H

#include <Arduino.h>

void initRfid();

// Kiểm tra MFRC522 còn sống không. Nếu bị reset/brownout, tự khởi tạo lại.
// Trả về true nếu OK.
bool ensureRfidReady();

bool isCardPresent();

String readCardUid();

#endif