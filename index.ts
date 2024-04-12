import express, { Express } from "express";
import cors from "cors";
import dotenv from "dotenv";
import routes from "./routes";
const swaggerUi = require('swagger-ui-express')
const swaggerFile = require('./swagger-output.json')
dotenv.config();

const app: Express = express();
const port = 3000;

app.use(cors());
app.use(express.json());
app.use(cors());
app.use(routes);

app.use('/doc', swaggerUi.serve, swaggerUi.setup(swaggerFile))

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});