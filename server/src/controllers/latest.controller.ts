import type { Request, Response } from "express";
import httpCode from "../constants/http.code.constant";
import httpReason from "../constants/http.reason.constant";
import memoryUntil from "../utils/memory.until";
import prisma from "../database/prisma.db";

function latest(req: Request, res: Response) {
  const uid = memoryUntil.get("uid") || "None";
  const id = memoryUntil.get("id") || "None";

  if (uid === "None") {
    return res
      .status(httpCode.OK)
      .json({ status: httpCode.OK, error: false, message: httpReason.OK, uid });
  }

  const add = `${process.env.BASE_URL}/latest/add/`;

  return res.status(httpCode.OK).json({
    status: httpCode.OK,
    error: false,
    message: httpReason.OK,
    uid,
    id,
    add,
  });
}

async function add(req: Request, res: Response) {
  const id = req.params.id;
  const uid = memoryUntil.get("uid") || "None";

  const user = await prisma.users.findUnique({
    where: {
      uid: uid as string,
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
      uid: uid as string,
      id: id,
    },
  });

  return res.status(httpCode.CREATED).json({
    status: httpCode.CREATED,
    error: false,
    message: httpReason.CREATED,
    id,
    uid,
  });
}

export { latest, add };
