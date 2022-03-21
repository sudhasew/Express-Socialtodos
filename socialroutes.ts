import express from "express";
import pg from "pg-promise";
const routes = express.Router();
const bcrypt = require("bcrypt");

const saltRounds = 10;
const db = pg()({
  host: "localhost",
  port: 5432,
  user: "postgres",
  password: "",
  database: "socialtodos",
});

routes.get("/users", (req, res) => {
  console.log("here");
  db.many("select * from users")
    .then((data) => {
      console.log(data);
      res.json(data);
    })
    .catch((err) => {
      console.log(err);
    });
});

routes.get("/users/:id", (req, res) => {
  const userId = { id: req.params.id };
  db.oneOrNone("select * from users where id=${id}", userId)
    .then((data) => {
      if (!data) {
        return res.status(404).send("user with id not found");
      }
      console.log(data);
      return res.json(data);
    })
    .catch((error) => console.log(error));
});

routes.post("/signup", (req, res) => {
  const hash = bcrypt.hashSync(req.body.password, saltRounds);
  const newUser = {
    first_name: req.body.first_name,
    last_name: req.body.last_name,
    email: req.body.email,
    password: hash,
  };

  db.oneOrNone("select id,email from users where email = ${email}", {
    email: req.body.email,
  }).then((user) => {
    if (user) {
      return res.status(400).send("Account with email address already exists.");
    }
    db.one(
      "insert into users(first_name,last_name,email,password) values (${first_name},${last_name},${email},${password}) returning id",
      newUser
    )
      .then((id) => {
        return db.oneOrNone(
          "select id,first_name,last_name,email,join_date from users where id =${id}",
          { id: id.id }
        );
      })
      .then((user) => res.status(201).json(user))
      .catch((error) => console.log(error));
  });
});

routes.post("/login", (req, res) => {
  db.oneOrNone("select id, email, password from users where email = ${email}", {
    email: req.body.email,
  }).then((user) => {
    if (!user) {
      return res.status(400).send("Invalid email address or password.");
    }
    console.log(user);
    if (!bcrypt.compareSync(req.body.password, user.password)) {
      return res.status(400).send("Invalid email address or password");
    }
    return res.json(user);
  });
});

routes.get("/socialtodos-todo", (req, res) => {
  console.log("here");
  db.many("select * from todo")
    .then((data) => {
      console.log(data);
      res.json(data);
    })
    .catch((err) => {
      console.log(err);
    });
});

routes.get("/socialtodos-todo/:id", (req, res) => {
  const todoId = { id: req.params.id };
  db.oneOrNone("select * from todo where id=${id}", todoId)
    .then((data) => {
      if (!data) {
        return res.status(404).send("todo with id not found");
      }
      console.log(data);
      return res.json(data);
    })
    .catch((error) => console.log(error));
});

routes.post("/socialtodos-todo", (req, res) => {
  const todoPost = {
    title: req.body.title,
    description: req.body.description,
    due_date: req.body.due_date,
    completed: req.body.completed,
    user_id: req.body.user_id,
  };

  db.one(
    "insert into todo (title,description,due_date,completed,user_id) values (${title},${description},${due_date},${completed},${user_id}) returning id,title,description,due_date,completed,user_id",
    todoPost
  )
    .then((data) => {
      return db.oneOrNone("select * from todo where id=${id}", { id: data.id });
    })
    .then((data) => res.json(data))
    .catch((error) => res.status(500).send(error));
});

routes.put("/socialtodos-todo/:id", (req, res) => {
  console.log(
    "hello here",
    req.params.id,
    req.body.title,
    req.body.description,
    req.body.due_date,
    req.body.completed,
    req.body.user_id
  );
  db.oneOrNone(
    "update todo set (title,description,due_date,completed) = ($(title),$(description),$(due_date),$(completed)) where id=$(id) returning id,title,description,due_date,completed,user_id",
    {
      id: req.params.id,
      title: req.body.title,
      description: req.body.description,
      due_date: req.body.due_date,
      completed: req.body.completed,
      user_id: req.body.user_id,
    }
  )
    .then((data) => res.json(data))
    .catch(() => {
      return res.status(404).json({ error: "The id could not be found" });
    });
});

routes.delete("/socialtodos-todo/:id", (req, res) => {
  db.one(
    "delete from todo where id=${id} returning id,title,description,due_date,completed,user_id",
    { id: req.params.id }
  )
    .then((data) => res.json(data))
    .catch((error) => console.log(error));
});

export default routes;
