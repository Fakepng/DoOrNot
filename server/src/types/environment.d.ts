declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: string;
      MQTT_BROKER: string;
      MQTT_TOPIC: string;
      BASE_URL: string;
    }
  }
}

export {};
