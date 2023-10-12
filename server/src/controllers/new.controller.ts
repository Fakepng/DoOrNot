import type { Request, Response } from "express";
import httpCode from "../constants/http.code.constant";
import httpReason from "../constants/http.reason.constant";

import prisma from "../database/prisma.db";

async function newId(req: Request, res: Response) {
  const uid = req.body.uid;
  const id = req.body.id;

  const user = await prisma.users.findUnique({
    where: {
      uid: uid,
    },
  });

  if (user) {
    return res.status(httpCode.CONFLICT).json({
      status: httpCode.CONFLICT,
      error: true,
      message: httpReason.CONFLICT,
    });
  }

  await prisma.users.create({
    data: {
      uid: uid,
      id: id,
    },
  });

  return res.status(httpCode.CREATED).json({
    status: httpCode.CREATED,
    error: false,
    message: httpReason.CREATED,
  });
}

export { newId };
