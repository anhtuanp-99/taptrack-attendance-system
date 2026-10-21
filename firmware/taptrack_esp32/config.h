#ifndef CONFIG_H
#define CONFIG_H

// =========================
// OLED - I2C
// =========================

#define OLED_SDA 21
#define OLED_SCL 22

#define OLED_WIDTH 128
#define OLED_HEIGHT 64

#define OLED_I2C_ADDRESS 0x3C


// =========================
// RFID - RC522 / SPI
// =========================

#define RFID_SS   16
#define RFID_RST  17

#define RFID_SCK  18
#define RFID_MISO 19
#define RFID_MOSI 23


// =========================
// LED
// =========================

#define LED_GREEN_PIN 12
#define LED_RED_PIN   13


// =========================
// Backend
// =========================

// IP Backend là IPv4 của Laptop trong mạng LAN (Port: 8080).
//
// CÁCH KIỂM TRA LẠI IP NẾU ĐỔI MẠNG / ĐỔI WIFI:
// 1. Mở PowerShell / CMD trên Windows, gõ lệnh: ipconfig
// 2. Tìm card mạng đang kết nối:
//    - Nếu dùng Wi-Fi:  Tìm mục "Wireless LAN adapter Wi-Fi"
//    - Nếu cắm dây:    Tìm mục "Ethernet adapter Ethernet"
// 3. Lấy giá trị tại dòng "IPv4 Address" 
//    Ví dụ:
//    IPv4 Address. . . . . . : 192.168.2.11
//    Khi IP thay đổi, sửa phần bên dưới:
//    Ví dụ:
//    #define BACKEND_BASE_URL "http://192.168.2.11:8080"
//
// LƯU Ý BỎ QUA:
// - Không lấy IP của card mạng ảo như "vEthernet (WSL)", "VMware", "Bluetooth".
//
// LƯU Ý KẾT NỐI:
// - ESP32 và Laptop phải bắt cùng một mạng Wi-Fi/LAN.
// - Cần mở port 8080 trên Windows Firewall nếu ESP32 không kết nối được.

#define BACKEND_BASE_URL "http://192.168.2.11:8080"

#define CARD_SCAN_ENDPOINT "/api/v1/attendance/card-scan"

#endif