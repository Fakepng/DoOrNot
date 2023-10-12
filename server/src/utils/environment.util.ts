function checkENV() {
  const env = process.env;

  const errors: string[] = [];

  if (!env.MQTT_BROKER) {
    errors.push("MQTT_BROKER is not set");
  }

  if (!env.MQTT_SUBSCRIBE) {
    errors.push("MQTT_SUBSCRIBE is not set");
  }

  if (!env.MQTT_PUBLISH) {
    errors.push("MQTT_PUBLISH is not set");
  }

  if (!env.BASE_URL) {
    errors.push("BASE_URL is not set");
  }

  if (errors.length > 0) {
    console.error("Environment variables are not set ❌");
    throw new Error(`\n${errors.join("\n")}`);
  }

  if (env.NODE_ENV !== "production") {
    console.warn("Environment is not production ❗");
  }

  console.log("Environment variables are all set ✅");
}

export { checkENV };
