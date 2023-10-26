import prisma from "../database/prisma.db";
import memoryUntil from "./memory.until";

import { mqttClient } from "../app";

async function processMQTT(topic: string, message: string) {
  if (topic !== `${process.env.MQTT_TOPIC}/uid`) {
    return;
  }

  const payload = JSON.parse(message);

  memoryUntil.set("uid", payload.uid);
  memoryUntil.set("uuid", payload.uuid);
  memoryUntil.set("id", "None");

  console.log("Card UID: ", payload.uid);

  const user = await prisma.users.findUnique({
    where: {
      uid: payload.uid,
    },
  });

  if (!user) {
    console.log("User not found");
    return;
  }

  await prisma.users.update({
    where: {
      uid: payload.uid,
    },
    data: {
      counter: {
        increment: 1,
      },
    },
  });

  const id = user.id;
  const command = "open";
  const uuid = payload.uuid;

  memoryUntil.set("id", id);

  console.log("User ID: ", id);

  const stringifyPayload = JSON.stringify({ id, command, uuid });

  mqttClient.publish(
    `${process.env.MQTT_TOPIC!}/command`,
    stringifyPayload,
    (err) => {
      if (err) {
        console.log(err);
      }
    }
  );

  const stringifyPayloadId = JSON.stringify({ id });

  mqttClient.publish(
    `${process.env.MQTT_TOPIC!}/stat`,
    stringifyPayloadId,
    (err) => {
      if (err) {
        console.log(err);
      }
    }
  );

  return { id, command, uuid };
}

export { processMQTT };
