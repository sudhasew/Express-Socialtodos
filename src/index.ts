import express from "express";
import cors from "cors";
import socialroutes from "../socialusers";
import socialtodoroutes from "../socialtodos";
import pg from "pg-promise";
const app = express();

export const db = pg()({
  host: "localhost",
  port: 5432,
  user: "postgres",
  password: "",
  database: "socialtodos",
});
const port = 3004;
app.use(express.json());
app.use(cors());
app.use("/", socialtodoroutes);
app.use("/", socialroutes);
app.listen(port, () => console.log(`Server started on port ${port}`));
