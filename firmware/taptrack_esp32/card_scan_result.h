#ifndef CARD_SCAN_RESULT_H
#define CARD_SCAN_RESULT_H

#include <Arduino.h>

struct CardScanResult {
    bool success = false;
    int  httpStatus = 0;

    // Dữ liệu backend trả về.
    long   employeeId = 0;
    String employeeName;
    String scanTime;
    String attendanceType;
    String checkInStatus;
    String checkOutStatus;
    String ledCommand;
    String oledMessage;

    // Chỉ dùng khi lỗi mạng / parse JSON (không phải lỗi nghiệp vụ backend).
    String errorMessage;
};

#endif