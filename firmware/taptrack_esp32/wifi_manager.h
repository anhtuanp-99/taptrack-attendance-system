#ifndef WIFI_MANAGER_H
#define WIFI_MANAGER_H

#include <Arduino.h>

bool connectWiFi();
bool isWiFiConnected();
String getWiFiIp();

#endif