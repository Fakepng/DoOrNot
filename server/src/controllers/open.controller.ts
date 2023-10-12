import type { Request, Response } from "express";
import httpCode from "../constants/http.code.constant";
import httpReason from "../constants/http.reason.constant";

import { mqttClient } from "../app";

function open(req: Request, res: Response) {
  const payload = {
    command: "open",
    uuid: "b046aa47-994f-4d50-8bee-e544133294f6",
  };

  mqttClient.publish(process.env.MQTT_PUBLISH!, JSON.stringify(payload));

  return res
    .status(httpCode.OK)
    .json({ status: httpCode.OK, error: false, message: httpReason.OK });
}

export { open };
