#ifndef TEXT_UTILS_H
#define TEXT_UTILS_H

#include <Arduino.h>

String removeVietnameseAccents(const String& text);
String toUpperAscii(const String& text);

#endif