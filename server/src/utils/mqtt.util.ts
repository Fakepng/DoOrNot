import prisma from "../database/prisma.db";
import memoryUntil from "./memory.until";

async function processMQTT(message: string) {
  const payload = JSON.parse(message);

  memoryUntil.set("uid", payload.uid);

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

  const id = user.id;
  const command = "open";
  const uuid = payload.uuid;

  console.log("User ID: ", id);

  return { id, command, uuid };
}

export { processMQTT };
