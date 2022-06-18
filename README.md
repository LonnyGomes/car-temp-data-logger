# car-temp-data-logger

An IoT project that logs temperature data with multiple sensors

## Parts

- [Adafruit M0 Datalogger microcontroller](https://www.adafruit.com/product/2796)
- [Adafruit PCF8523 Real Time Clock Assembled Breakout Board](https://www.adafruit.com/product/3295)
- [CR1220 coin cell battery](https://www.adafruit.com/product/380)
- [Inland KS0329 Keyestudio 18B20 Waterproof Temperature Sensor (3 pack)](https://www.microcenter.com/product/639732/inland-ks0329-keyestudio-18b20-waterproof-temperature-sensor-47k-resistor-(3pcs))
- [Lithium Ion Polymer 3.7v battery](https://www.adafruit.com/product/328)


## Dependencies

### Arduino

#### Board managers

- Arduino SAMD boards (32-bits ARm Cortex-M0+): >= v1.8.13
- Adafruit SAMD Boards: >= 1.7.10

#### Libraries

- SD
- SPI
- Dally Temperature by Miles Burton: >= v3.9.0
- One Wire by Paul Stoffregen >= v2.3.7
- RTCLib by Adafruit => v2.0.3

## Resources

- [M0 Data loggger tutorial](https://learn.adafruit.com/adafruit-feather-m0-adalogger)
- [Guide for using DS18B20 Temperature Sensor with Arduino](https://randomnerdtutorials.com/guide-for-ds18b20-temperature-sensor-with-arduino/)
- [DS1307 Real Time Clock Breakout board Kit](https://learn.adafruit.com/ds1307-real-time-clock-breakout-board-kit/overview)
