#include <SPI.h>
#include <SD.h>
#include <OneWire.h>
#include <DallasTemperature.h>
#include "RTClib.h"

#define LOOP_MS_DELAY 30000
#define ERR_SD_INIT 2
#define ERR_SD_OPEN 3
#define ERR_RCT_INIT 4

// Set the pins used
#define PIN_CARD_SELECT 4
#define PIN_ERROR_LED 13
#define PIN_STATUS_LED 8
#define PIN_ONE_WIRE_BUS 6 // Data wire used for temp sensors

// define file reference to interface with the SD card
File logfile;

// Setup a oneWire instance to communicate with any OneWire devices
OneWire oneWire(PIN_ONE_WIRE_BUS);

// Pass our oneWire reference to Dallas Temperature sensor
DallasTemperature sensors(&oneWire);
uint8_t sensorCount; // stores total number of connected sensors

// Define reference to the RTC breakout
RTC_PCF8523 rtc;

// blink out an error code
void error(uint8_t errno) {
  while (1) {
    uint8_t i;
    for (i = 0; i < errno; i++) {
      digitalWrite(PIN_ERROR_LED, HIGH);
      delay(100);
      digitalWrite(PIN_ERROR_LED, LOW);
      delay(100);
    }
    for (i = errno; i < 10; i++) {
      delay(200);
    }
  }
}

void setup() {
  Serial.begin(57600);
  Serial.println("\r\nAnalog logger test");
  pinMode(PIN_ERROR_LED, OUTPUT);

  if (! rtc.begin()) {
    Serial.println("Couldn't find RTC");
    Serial.flush();
    error(ERR_RCT_INIT);
  }

  if (! rtc.initialized() || rtc.lostPower()) {
    Serial.println("RTC is NOT initialized, let's set the time!");
    // When time needs to be set on a new device, or after a power loss, the
    // following line sets the RTC to the date & time this sketch was compiled
    rtc.adjust(DateTime(F(__DATE__), F(__TIME__)));
    // This line sets the RTC with an explicit date & time, for example to set
    // January 21, 2014 at 3am you would call:
    // rtc.adjust(DateTime(2014, 1, 21, 3, 0, 0));
    //
    // Note: allow 2 seconds after inserting battery or applying external power
    // without battery before calling adjust(). This gives the PCF8523's
    // crystal oscillator time to stabilize. If you call adjust() very quickly
    // after the RTC is powered, lostPower() may still return true.
  }

  // When time needs to be re-set on a previously configured device, the
  // following line sets the RTC to the date & time this sketch was compiled
  // rtc.adjust(DateTime(F(__DATE__), F(__TIME__)));
  // This line sets the RTC with an explicit date & time, for example to set
  // January 21, 2014 at 3am you would call:
  //rtc.adjust(DateTime(2022, 6, 17, 20, 26, 0));

  // When the RTC was stopped and stays connected to the battery, it has
  // to be restarted by clearing the STOP bit. Let's do this to ensure
  // the RTC is running.
  rtc.start();

  // see if the card is present and can be initialized:
  if (!SD.begin(PIN_CARD_SELECT)) {
    Serial.println("Card init. failed!");
    error(ERR_SD_INIT);
  }

  // Start up the temperature sensor library
  sensors.begin();

  // capture how many temperature sensors are found
  sensorCount = sensors.getDeviceCount();

  Serial.print("Total sensor count: ");
  Serial.println(sensorCount);

  char filename[15];
  strcpy(filename, "/DATA_000.CSV");
  for (uint8_t i = 0; i < 100; i++) {
    filename[6] = '0' + i / 100;
    filename[7] = '0' + i / 10;
    filename[8] = '0' + i % 10;
    // create if does not exist, do not open existing, write, sync after write
    if (! SD.exists(filename)) {
      break;
    }
  }

  logfile = SD.open(filename, FILE_WRITE);
  if ( ! logfile ) {
    Serial.print("Couldnt create ");
    Serial.println(filename);
    error(ERR_SD_OPEN);
  }
  Serial.print("Writing to ");
  Serial.println(filename);

  // generate header for CSV file
  char sensorName[12];
  logfile.print("date,");
  for (uint8_t si = 0; si < sensorCount - 1; si++) {
    sprintf(sensorName, "sensor_%d,", si + 1);
    logfile.print(sensorName);
  }
  sprintf(sensorName, "sensor_%d", sensorCount);
  logfile.println(sensorName);

  pinMode(PIN_ERROR_LED, OUTPUT);
  pinMode(PIN_STATUS_LED, OUTPUT);
  Serial.println("Ready!");
}

void loop() {
  DateTime time = rtc.now();

  char dateBuf[32];
  sprintf(dateBuf, "%d/%d/%d %02d:%02d:%02d",
          time.month(), time.day(), time.year(), time.hour(), time.minute(), time.second()
         );
  Serial.println(dateBuf);

  // Call sensors.requestTemperatures() to issue a global temperature and Requests to all devices on the bus
  sensors.requestTemperatures();

  uint8_t curDeviceAddress = 0;

  digitalWrite(PIN_STATUS_LED, HIGH);

  logfile.print(dateBuf);
  logfile.print(",");

  for (uint8_t si = 0; si < sensorCount; si++) {
    Serial.print("Temperature reading for sensor_");
    Serial.println(si + 1);
    Serial.print(" - Celsius temperature: ");
    Serial.println(sensors.getTempCByIndex(si));
    Serial.print(" - Fahrenheit temperature: ");
    Serial.println(sensors.getTempFByIndex(si));

    // handle last sensor output differently
    if (si == (sensorCount - 1)) {
      logfile.println(sensors.getTempFByIndex(si));
    } else {
      logfile.print(sensors.getTempFByIndex(si));
      logfile.print(",");
    }

    logfile.flush(); // only keep for testing
  }

  digitalWrite(PIN_STATUS_LED, LOW);

  delay(5000); //LOOP_MS_DELAY
}
