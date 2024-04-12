import express, { Express } from "express";
import cors from "cors";
import dotenv from "dotenv";
import routes from "./routes";
dotenv.config();

const app: Express = express();
const port = 3000;

app.use(cors());
app.use(express.json());
app.use(cors());
app.use(routes);


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});