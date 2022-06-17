#include <SPI.h>
#include <SD.h>
#include <OneWire.h>
#include <DallasTemperature.h>

// Set the pins used
#define PIN_CARD_SELECT 4
#define PIN_ONBOARD_LED 13
// Data wire used for temp sensors
#define PIN_ONE_WIRE_BUS 6

// define file reference to interface with the SD card
File logfile;

// Setup a oneWire instance to communicate with any OneWire devices
OneWire oneWire(PIN_ONE_WIRE_BUS);

// Pass our oneWire reference to Dallas Temperature sensor
DallasTemperature sensors(&oneWire);

// blink out an error code
void error(uint8_t errno) {
  while (1) {
    uint8_t i;
    for (i = 0; i < errno; i++) {
      digitalWrite(PIN_ONBOARD_LED, HIGH);
      delay(100);
      digitalWrite(PIN_ONBOARD_LED, LOW);
      delay(100);
    }
    for (i = errno; i < 10; i++) {
      delay(200);
    }
  }
}

void setup() {
  Serial.begin(9600);
  Serial.println("\r\nAnalog logger test");
  pinMode(PIN_ONBOARD_LED, OUTPUT);

  // Start up the temperature sensor library
  sensors.begin();

  // see if the card is present and can be initialized:
  if (!SD.begin(PIN_CARD_SELECT)) {
    Serial.println("Card init. failed!");
    error(5);
  }

  char filename[15];
  strcpy(filename, "/DATA_G00.TXT");
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
    error(3);
  }
  Serial.print("Writing to ");
  Serial.println(filename);

  pinMode(PIN_ONBOARD_LED, OUTPUT);
  pinMode(8, OUTPUT);
  Serial.println("Ready!");
}

uint8_t i = 0;
void loop() {
  // Call sensors.requestTemperatures() to issue a global temperature and Requests to all devices on the bus
  sensors.requestTemperatures();

  Serial.print("Celsius temperature: ");
  // Why "byIndex"? You can have more than one IC on the same bus. 0 refers to the first IC on the wire
  Serial.println(sensors.getTempCByIndex(0));
  Serial.print(" - Fahrenheit temperature #1: ");
  Serial.println(sensors.getTempFByIndex(0));
  Serial.print(" - Fahrenheit temperature #2: ");
  Serial.println(sensors.getTempFByIndex(1));

  digitalWrite(8, HIGH);
  logfile.print("A0 = "); logfile.println(analogRead(0));
  Serial.print("A0 = "); Serial.println(analogRead(0));
  digitalWrite(8, LOW);

  delay(5000);
}
