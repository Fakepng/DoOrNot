#include <Arduino.h>
#include <ESP8266WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include <MFRC522.h>

#include "debug_pattern.h"

const int BAUD_RATE = 9600;

const char* DEVICE_NAME       = "DoOrNot";
const char* WIFI_SSID         = "Fakepng-IoT";
const char* WIFI_PASSWORD     = "iotengineering";
const int WIFI_TIMEOUT_MS     = 10000;
unsigned long lastWifiAttempt = 0;

WiFiClient wifiClient;

int connectToWiFi(const char* ssid, const char* pwd);
void failedToConnectToWiFi();


const char* MQTT_BROKER    = "mqtt.fakepng.dev";
const char* MQTT_CLIENT    = "b046aa47-994f-4d50-8bee-e544133294f6";
const int MQTT_PORT        = 39736;
const char* MQTT_USERNAME  = "fakepng";
const char* MQTT_PASSWORD  = "u2e7F8qA4aACjBvD";
const char* MQTT_TOPIC     = "doornot";

void connectToMQTT(const char* clientId, const char* username, const char* password , const char* broker, const char* topic);
void mqttCallback(const char* topic, byte* payload, unsigned int length);
void publishMQTT(const char* payload, const char* topic);

PubSubClient mqttClient(wifiClient);

const char* BOARD_UUID    = "b046aa47-994f-4d50-8bee-e544133294f6";
const int PUSH_BUTTON_PIN = D3;
const int DOOR_LATCH_PIN  = D0;
const int BUZZER_PIN      = D8;
const int KEEP_OPEN_MS    = 5000;
int IS_OPEN               = 0;
unsigned long lastOpen    = 0;

void openLatch();

const int SS_PIN  = D2;
const int RST_PIN = D1;

MFRC522 rfid(SS_PIN, RST_PIN);
MFRC522::MIFARE_Key key;

void printHex(byte *buffer, byte bufferSize);

const int DEBUG_LED_PIN    = LED_BUILTIN;
const int INVERT_DEBUG_LED = 1;
const int DEBUG_SHORT_MS   = 200;
const int DEBUG_LONG_MS    = 600;
const int DEBUG_SPACE_MS   = 600;
const int DEBUG_PAUSE_MS   = 1000;
const int HEARTBEAT_MS     = 10000;
int lastHeartbeat          = 0;

void debugLed(const char* pattern);
void debugLed(int state);
void debugLed();

unsigned long lastButtonPress = 0;
void IRAM_ATTR isr() {
  unsigned long now = millis();
  if (now - lastButtonPress < KEEP_OPEN_MS + 500) {return;}
  lastButtonPress = now;

  String payload;

  DynamicJsonDocument doc(1024);
  doc["uuid"] = BOARD_UUID;
  doc["id"]  = "Push Button";
  serializeJson(doc, payload);

  char topic[100];
  sprintf(topic,"%s%s",MQTT_TOPIC,"/stat");
  publishMQTT(payload.c_str(), topic);

  openLatch();
}

void setup() {
  digitalWrite(DOOR_LATCH_PIN, HIGH);
  Serial.begin(BAUD_RATE);

  pinMode(DEBUG_LED_PIN, OUTPUT);
  pinMode(DOOR_LATCH_PIN, OUTPUT);

  pinMode(PUSH_BUTTON_PIN, INPUT_PULLUP);
  attachInterrupt(PUSH_BUTTON_PIN, isr, FALLING);

  debugLed(BOOTING);

  WiFi.mode(WIFI_STA);
  WiFi.hostname(DEVICE_NAME);

  mqttClient.setServer(MQTT_BROKER, MQTT_PORT);
  mqttClient.setCallback(mqttCallback);

  char subscribe[100];
  sprintf(subscribe,"%s%s",MQTT_TOPIC,"/command");
  mqttClient.subscribe(subscribe);

  SPI.begin();
  rfid.PCD_Init();
}

void loop() {
  if (WiFi.status() != WL_CONNECTED) {
    if (!connectToWiFi(WIFI_SSID, WIFI_PASSWORD)) {failedToConnectToWiFi();}
  }

  if (!mqttClient.connected()) {
    char subscribe[100];
    sprintf(subscribe,"%s%s",MQTT_TOPIC,"/command");
    connectToMQTT(MQTT_CLIENT, MQTT_USERNAME, MQTT_PASSWORD, MQTT_BROKER, subscribe);
  }
  mqttClient.loop();

  unsigned long now = millis();

  if (now - lastHeartbeat > HEARTBEAT_MS) {
    lastHeartbeat = now;
    String payload = "{\"uuid\":\"" + String(BOARD_UUID) + "\"}";
    char topic[100];
    sprintf(topic,"%s%s",MQTT_TOPIC,"/heartbeat");
    publishMQTT(payload.c_str(), topic);
  }

  if (!rfid.PICC_IsNewCardPresent()) {return;}
  if (!rfid.PICC_ReadCardSerial()) {return;}

  debugLed();

  Serial.print(F("Card UID:"));
  printHex(rfid.uid.uidByte, rfid.uid.size);
  Serial.println();

  String UID = "";
  for (int i = 0; i < rfid.uid.size; i++) {
    UID += String(rfid.uid.uidByte[i], HEX);
  }

  String payload;

  DynamicJsonDocument doc(1024);
  doc["uuid"] = BOARD_UUID;
  doc["uid"]  = UID;
  serializeJson(doc, payload);

  char topic[100];
  sprintf(topic,"%s%s",MQTT_TOPIC,"/uid");
  publishMQTT(payload.c_str(), topic);

  rfid.PICC_HaltA();
  rfid.PCD_StopCrypto1();
}

void printHex(byte *buffer, byte bufferSize) {
  char hexString[16];

  for (byte i = 0; i < bufferSize; i++) {
    Serial.print(buffer[i] < 0x10 ? " 0" : " ");
    Serial.print(buffer[i], HEX);
    sprintf(hexString+i*2, "%02x", buffer[i]);
  } 
}

void openLatch() {
  if (IS_OPEN) {return;}

  unsigned long now = millis();
  if (now - lastOpen < KEEP_OPEN_MS + 100) {return;}
  lastOpen = now;

  tone(BUZZER_PIN, 440);
  delay(100);
  noTone(BUZZER_PIN);

  IS_OPEN = 1;
  debugLed(HIGH);
  digitalWrite(DOOR_LATCH_PIN, LOW);
  delay(KEEP_OPEN_MS);
  digitalWrite(DOOR_LATCH_PIN, HIGH);
  debugLed(LOW);
  IS_OPEN = 0;
}

int connectToWiFi(const char* ssid, const char* pwd) {
  lastWifiAttempt = millis();

  Serial.println("Connecting to WiFi network: " + String(ssid));
  WiFi.begin(ssid, pwd);
  while (WiFi.status() != WL_CONNECTED) {
    if (millis() - lastWifiAttempt > WIFI_TIMEOUT_MS) {
      Serial.println("Failed to connect to WiFi");
      return 0;
    }

    delay(500);
    Serial.print(".");
  }
  Serial.println("");
  Serial.println("Connected to the: " + String(ssid));
  Serial.println("IP address: " + WiFi.localIP().toString());
  debugLed(WIFI_CONNECTED);

  return 1;
}

void failedToConnectToWiFi() {
  Serial.println("Failed to connect to WiFi");
  debugLed(FAILED_TO_CONNECT_TO_WIFI);
}

void connectToMQTT(const char* clientId, const char* username, const char* password , const char* broker, const char* topic) {
  while (!mqttClient.connected()) {
    Serial.println("Connecting to MQTT broker: " + String(broker));

    if (mqttClient.connect(clientId, username, password)) {
      Serial.println("MQTT connected");
      mqttClient.subscribe(topic);
      debugLed(MQTT_CONNECTED);
    
    } else {
      Serial.println("MQTT failed, rc=" + String(mqttClient.state()));
      Serial.println("Retrying in 5 seconds...");
      debugLed(FAILED_TO_CONNECT_TO_MQTT);
      delay(5000);
    }
  }

}

void mqttCallback(const char* topic, byte* payload, unsigned int length) {
  Serial.println("Message arrived [" + String(topic) + "]");

  String message;
  for (unsigned int i = 0; i < length; i++) {
    message += (char)payload[i];
  }

  Serial.println(message);
  char subscribe[100];
  sprintf(subscribe,"%s%s",MQTT_TOPIC,"/command");
  if (String(topic) == subscribe) {
    DynamicJsonDocument doc(1024);
    deserializeJson(doc, message);

    const char* command = doc["command"];
    const char* uuid    = doc["uuid"];

    if (strcmp(uuid, BOARD_UUID) != 0) {return;}

    if (strcmp(command, "open") == 0) {
      openLatch();
    }
  }
}

void publishMQTT(const char* payload, const char* topic) {
  Serial.println("Publishing message to topic: " + String(topic));
  mqttClient.publish(topic, payload);
}

void debugLed(const char* pattern) {
  int ledOn = INVERT_DEBUG_LED ? LOW : HIGH;
  int ledOff = INVERT_DEBUG_LED ? HIGH : LOW;

  for (size_t i = 0; i < strlen(pattern); i++) {
    if (pattern[i] == '.') {
      digitalWrite(DEBUG_LED_PIN, ledOn);
      delay(DEBUG_SHORT_MS);

    } else if (pattern[i] == '-') {
      digitalWrite(DEBUG_LED_PIN, ledOn);
      delay(DEBUG_LONG_MS);

    } else if (pattern[i] == ' ') {
      digitalWrite(DEBUG_LED_PIN, ledOff);
      delay(DEBUG_SPACE_MS);

    } else {
      digitalWrite(DEBUG_LED_PIN, ledOff);
      delay(DEBUG_SHORT_MS);
      
    }

    digitalWrite(DEBUG_LED_PIN, ledOff);
    delay(DEBUG_SHORT_MS);
  }

  delay(DEBUG_PAUSE_MS);
}

void debugLed(int state) {
  int ledOn = INVERT_DEBUG_LED ? LOW : HIGH;
  int ledOff = INVERT_DEBUG_LED ? HIGH : LOW;

  digitalWrite(DEBUG_LED_PIN, state ? ledOn : ledOff);
}

void debugLed() {
  int ledOn = INVERT_DEBUG_LED ? LOW : HIGH;
  int ledOff = INVERT_DEBUG_LED ? HIGH : LOW;

  digitalWrite(DEBUG_LED_PIN, ledOn);
  delay(DEBUG_SHORT_MS);
  digitalWrite(DEBUG_LED_PIN, ledOff);
}