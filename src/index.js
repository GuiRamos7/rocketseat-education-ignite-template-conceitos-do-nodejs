const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");
const { json } = require("express");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.some((user) => user.username === username);

  if (!user) {
    return response.status(400).json({ error: "User not found!" });
  }

  request.username = username;
  return next();
}

function checksExistsTodoOnUser(request, response, next) {
  const { username } = request.headers;
  const { id } = request.params;

  const user = users.find((user) => user.username === username);
  const hasTodo = user.todos.some((todo) => todo.id === id);

  if (!hasTodo) {
    return response.status(404).json({ error: "Not Found" });
  }

  return next();
}

app.post("/users", (request, response) => {
  const { name, username } = request.body;

  const userAlreadyExists = users.some((user) => user.username === username);

  if (userAlreadyExists) {
    return response.status(400).json({ error: "User already exists!" });
  }

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: [],
  };

  users.push(user);

  return response.status(201).send(user);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { username } = request;

  const user = users.find((user) => user.username === username);

  return response.send(user.todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { username } = request;
  const { title, deadline } = request.body;

  const user = users.find((user) => user.username === username);

  const dateFormat = new Date(deadline);

  const todo = {
    title,
    deadline: dateFormat,
    id: uuidv4(),
    done: false,
    created_at: new Date(),
  };

  user.todos.push(todo);

  return response.status(201).json(todo);
});

app.put(
  "/todos/:id",
  checksExistsUserAccount,
  checksExistsTodoOnUser,
  (request, response) => {
    const { username } = request;
    const { title, deadline } = request.body;
    const { id } = request.params;

    const user = users.find((user) => user.username === username);
    const todo = user.todos.filter((td) => td.id === id).pop();
    const todoWithoutEditable = user.todos.filter((td) => td.id !== id);

    const newTodo = {
      ...todo,
      title,
      deadline: new Date(deadline),
    };

    user.todos = [...todoWithoutEditable, newTodo];

    return response.status(201).json(newTodo);
  }
);

app.patch(
  "/todos/:id/done",
  checksExistsUserAccount,
  checksExistsTodoOnUser,
  (request, response) => {
    const { username } = request;
    const { id } = request.params;

    const user = users.find((user) => user.username === username);
    const todo = user.todos.filter((td) => td.id === id).pop();
    const todoWithoutEditable = user.todos.filter((td) => td.id !== id);

    const newTodo = {
      ...todo,
      done: true,
    };

    user.todos = [...todoWithoutEditable, newTodo];

    return response.status(200).json(newTodo);
  }
);

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  // Complete aqui
});

module.exports = app;
