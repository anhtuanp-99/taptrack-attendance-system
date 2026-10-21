#include "rfid_reader.h"
#include "config.h"

#include <SPI.h>
#include <MFRC522.h>

namespace {

MFRC522 rfid(RFID_SS, RFID_RST);

// Version register hợp lệ của MFRC522 là 0x91 hoặc 0x92.
// Nếu đọc được 0x00 hoặc 0xFF → chip đã bị reset hoặc mất kết nối SPI.
bool isRfidVersionValid() {
    const byte version = rfid.PCD_ReadRegister(MFRC522::VersionReg);
    return (version == 0x91 || version == 0x92);
}

void reinitRfid() {
    rfid.PCD_Init();
    delay(50);
    Serial.println("[RFID] MFRC522 bi reset - da khoi tao lai");
}

}  // namespace

void initRfid() {
    SPI.begin(RFID_SCK, RFID_MISO, RFID_MOSI, RFID_SS);
    rfid.PCD_Init();
    delay(50);
    Serial.printf("[RFID] MFRC522 version: 0x%02X\n",
                  rfid.PCD_ReadRegister(MFRC522::VersionReg));
    Serial.println("RFID initialized");
}

bool ensureRfidReady() {
    if (isRfidVersionValid()) {
        return true;
    }
    reinitRfid();
    return isRfidVersionValid();
}

bool isCardPresent() {
    return rfid.PICC_IsNewCardPresent() && rfid.PICC_ReadCardSerial();
}

String readCardUid() {
    char buffer[3];
    String uid;
    uid.reserve(rfid.uid.size * 2);

    for (byte i = 0; i < rfid.uid.size; ++i) {
        snprintf(buffer, sizeof(buffer), "%02X", rfid.uid.uidByte[i]);
        uid += buffer;
    }

    rfid.PICC_HaltA();
    rfid.PCD_StopCrypto1();

    return uid;
}