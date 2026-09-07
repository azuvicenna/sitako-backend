import express from "express";
import routes from "./routes";
import { requestLogger } from "./middleware/request-logger";

const app = express();

app.use(express.json());
app.use(requestLogger);

app.use("/api", routes);

export default app;
