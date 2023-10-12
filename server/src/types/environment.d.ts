declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: string;
      MQTT_BROKER: string;
      MQTT_SUBSCRIBE: string;
      MQTT_PUBLISH: string;
      BASE_URL: string;
    }
  }
}

export {};
