#include <SPI.h>
#include <SD.h>

// Set the pins used
#define PIN_CARD_SELECT 4
#define PIN_ONBOARD_LED 13

File logfile;

// blink out an error code
void error(uint8_t errno) {
  while(1) {
    uint8_t i;
    for (i=0; i<errno; i++) {
      digitalWrite(PIN_ONBOARD_LED, HIGH);
      delay(100);
      digitalWrite(PIN_ONBOARD_LED, LOW);
      delay(100);
    }
    for (i=errno; i<10; i++) {
      delay(200);
    }
  }
}

void setup() {
  Serial.begin(9600);
  Serial.println("\r\nAnalog logger test");
  pinMode(PIN_ONBOARD_LED, OUTPUT);


  // see if the card is present and can be initialized:
  if (!SD.begin(PIN_CARD_SELECT)) {
    Serial.println("Card init. failed!");
    error(5);
  }
  
  char filename[15];
  strcpy(filename, "/DATA_G00.TXT");
  for (uint8_t i = 0; i < 100; i++) {
    filename[6] = '0' + i/100;
    filename[7] = '0' + i/10;
    filename[8] = '0' + i%10;
    // create if does not exist, do not open existing, write, sync after write
    if (! SD.exists(filename)) {
      break;
    }
  }

  logfile = SD.open(filename, FILE_WRITE);
  if( ! logfile ) {
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

uint8_t i=0;
void loop() {
  digitalWrite(8, HIGH);
  logfile.print("A0 = "); logfile.println(analogRead(0));
  Serial.print("A0 = "); Serial.println(analogRead(0));
  digitalWrite(8, LOW);
  
  delay(5000);
}
