import express from "express";
import pg from "pg-promise";
const Joi = require("joi");
const routes = express.Router();

const schema = Joi.object({
  title: Joi.string().min(1).max(100).required(),

  description: Joi.string().min(1).max(500),

  due_date: Joi.date().greater("now").iso(),

  completed: Joi.boolean().required(),
});

const db = pg()({
  host: "localhost",
  port: 5432,
  user: "postgres",
  password: "",
  database: "todo",
});

routes.get("/todo", (req, res) => {
  db.manyOrNone("select * from todo")
    .then((data) => res.json(data))
    .catch((error) => console.log(error));
});

routes.get("/todo/:id", (req, res) => {
  db.oneOrNone("select * from todo where id=${id}", { id: req.params.id })
    .then((data) => res.json(data))
    .catch((error) => console.log(error));
});

routes.post("/todo/", (req, res) => {
  const todo = {
    title: req.body.title,
    description: req.body.description,
    due_date: req.body.due_date,
    completed: req.body.completed,
  };
  const valid = schema.validate(todo);

  if (valid.error) {
    return res.status(400).send(valid.error);
  }
  db.one(
    "insert into todo(title,description,due_date,completed) values (${title},${description},${due_date},${completed}) returning id,title,description,due_date,completed",
    todo
  )
    .then((data) => {
      return db.oneOrNone("select * from todo where id=${id}", { id: data.id });
    })
    .then((data) => res.json(data))
    .catch((error) => res.status(500).send(error));
});

routes.put("/todo/:id", (req, res) => {
  console.log(
    req.params.id,
    req.body.title,
    req.body.description,
    req.body.due_date,
    req.body.completed
  );
  db.oneOrNone(
    "update todo set (title,description,due_date,completed) = ($(title),$(description),$(due_date),$(completed)) where id=$(id) returning id,title,description,due_date,completed",
    {
      id: req.params.id,
      title: req.body.title,
      description: req.body.description,
      due_date: req.body.due_date,
      completed: req.body.completed,
    }
  )
    .then((data) => res.json(data))
    .catch(() => {
      return res.status(404).json({ error: "The id could not be found" });
    });
});

routes.delete("/todo/:id", (req, res) => {
  db.oneOrNone(
    "delete from todo where id = ${id} returning id,title,description,due_date,completed",
    { id: req.params.id }
  )
    .then((data) => res.json(data))
    .catch((error) => console.log(error));
});
export default routes;
