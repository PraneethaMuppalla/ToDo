const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "todoApplication.db");

let db = null;

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server started Successfully");
    });
  } catch (e) {
    console.log(e.message);
  }
};

initializeDbAndServer();

app.get("/todos/", async (req, res) => {
  const { status = "", priority = "", search_q = "" } = req.query;
  const getTodoQuery = `SELECT *
    FROM todo
    WHERE status LIKE '%${status}%'
    AND priority LIKE '%${priority}%'
    AND todo LIKE '%${search_q}%'`;
  const todoArray = await db.all(getTodoQuery);
  res.send(todoArray);
});

app.get("/todos/:todoId/", async (req, res) => {
  const { todoId } = req.params;
  const getTodoQuery = `SELECT *
                            FROM todo
                            WHERE id = ${todoId}`;
  const todo = await db.get(getTodoQuery);
  res.send(todo);
});

app.post("/todos/", async (req, res) => {
  const { id, todo, priority, status } = req.body;
  const insertTodo = `INSERT INTO 
                        todo (id,todo,priority,status)
                        VALUES
                        (${id},'${todo}','${priority}','${status}');`;
  await db.run(insertTodo);
  res.send("Todo Successfully Added");
});

app.put("/todos/:todoId", async (req, res) => {
  const { todoId } = req.params;
  let updateColumn = "";
  const requestBody = req.body;
  switch (true) {
    case requestBody.status !== undefined:
      updateColumn = "Status";
      break;
    case requestBody.priority !== undefined:
      updateColumn = "Priority";
      break;
    case requestBody.todo !== undefined:
      updateColumn = "Todo";
      break;
  }
  const previousTodoQuery = `SELECT *
                        FROM todo
                        WHERE id = ${todoId}`;
  const previousTodo = await db.get(previousTodoQuery);

  const {
    status = previousTodo.status,
    priority = previousTodo.priority,
    todo = previousTodo.todo,
  } = req.body;
  const updateTodoQuery = `
    UPDATE
      todo
    SET
      todo='${todo}',
      priority='${priority}',
      status='${status}'
    WHERE
      id = ${todoId};`;

  await db.run(updateTodoQuery);
  res.send(`${updateColumn} Updated`);
});

app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deleteTodoQuery = `
  DELETE FROM
    todo
  WHERE
    id = ${todoId};`;

  await db.run(deleteTodoQuery);
  response.send("Todo Deleted");
});

module.exports = app;
