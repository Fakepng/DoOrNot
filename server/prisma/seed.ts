import fs from "fs";

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  fs.readFile("./src/database/log.csv", "utf8", async (err, data) => {
    const rows = data.split("\n");
    const rowsData = rows.map((row) => row.split(","));

    const filteredRowsData = rowsData.filter((row) => row.length === 2);

    for (const row of filteredRowsData) {
      const [id, uid] = row;

      await prisma.users.create({
        data: {
          uid: uid,
          id: id,
        },
      });
    }
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
