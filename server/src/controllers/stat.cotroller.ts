import type { Request, Response } from "express";
import httpCode from "../constants/http.code.constant";
import httpReason from "../constants/http.reason.constant";

import prisma from "../database/prisma.db";

async function frequent(req: Request, res: Response) {
  const users = await prisma.users.findMany({
    select: {
      id: true,
      counter: true,
    },
    orderBy: {
      counter: "desc",
    },
  });

  return res
    .status(httpCode.OK)
    .json({ status: httpCode.OK, error: false, message: httpReason.OK, users });
}

export { frequent };
