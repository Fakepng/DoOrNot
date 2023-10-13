import dotenv from "dotenv";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import bodyParser from "body-parser";
import helmet from "helmet";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import * as mqtt from "mqtt";

import httpCode from "./constants/http.code.constant";
import httpReason from "./constants/http.reason.constant";
import { checkENV } from "./utils/environment.util";
import { corsOptions } from "./config/cors.config";
import { swaggerOptions } from "./config/swagger.config";
import basePath from "./routes/base.route";
import openPath from "./routes/open.route";
import latestPath from "./routes/latest.route";
import { processMQTT } from "./utils/mqtt.util";

dotenv.config();
checkENV();

const app = express();
const specs = swaggerJsdoc(swaggerOptions);

const mqttClient = mqtt.connect(process.env.MQTT_BROKER!);

app.use(helmet()); //Security
app.disable("x-powered-by"); //Reduce Fingerprinting

app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(express.json());

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  return res
    .status(httpCode.INTERNAL_SERVER_ERROR)
    .send(httpReason.INTERNAL_SERVER_ERROR);
});

app.use("/", basePath);
app.use("/open", openPath);
app.use("/latest", latestPath);

if (process.env.NODE_ENV !== "production") {
  console.log("Swagger UI is running at /api-docs");
  app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(specs, { explorer: true })
  );
}

app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(httpCode.NOT_FOUND).send(httpReason.NOT_FOUND);
});

mqttClient.on("connect", () => {
  console.log("MQTT Broker connected");
  mqttClient.subscribe(process.env.MQTT_SUBSCRIBE!, (err) => {
    if (err) {
      console.log(err);
    }
  });
});

mqttClient.on("message", async (topic, message) => {
  const jsonPayload = await processMQTT(message.toString());

  if (!jsonPayload) {
    return;
  }

  const payload = JSON.stringify(jsonPayload);

  mqttClient.publish(process.env.MQTT_PUBLISH!, payload, (err) => {
    if (err) {
      console.log(err);
    }
  });
});

export { mqttClient };

app.listen(parseInt(process.env.PORT || "3000"), () => {
  console.log(`Server running at port ${process.env.PORT || "3000"} 🚀`);
});
