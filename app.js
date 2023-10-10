const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const { format } = require("date-fns");
var isValid = require("date-fns/isValid");
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
      console.log("Server started at http://localhost:3000");
    });
  } catch (e) {
    console.log(`Db Error ${e.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

module.exports = app;

const checkingScenario = (request, response, next) => {
  const { status, priority, category, date } = request.query;
  const isValidDate = isValid(new Date(date));

  if (
    status !== "DONE" &&
    status !== "IN PROGRESS" &&
    status !== "TO DO" &&
    status !== undefined
  ) {
    response.status(400);
    response.send("Invalid Todo Status");
  } else if (
    priority !== "MEDIUM" &&
    priority !== "HIGH" &&
    priority !== "LOW" &&
    priority !== undefined
  ) {
    response.status(400);
    response.send("Invalid Todo Priority");
  } else if (
    category !== "WORK" &&
    category !== "HOME" &&
    category !== "LEARNING" &&
    category !== undefined
  ) {
    response.status(400);
    response.send("Invalid Todo Category");
  } else if (isValidDate === false && date !== undefined) {
    response.status(400);
    response.send("Invalid Due Date");
  } else {
    next();
  }
};

const checkingScenario2 = (request, response, next) => {
  const { status, priority, category, dueDate } = request.body;
  const isValidDate = isValid(new Date(dueDate));

  if (
    status !== "DONE" &&
    status !== "IN PROGRESS" &&
    status !== "TO DO" &&
    status !== undefined
  ) {
    response.status(400);
    response.send("Invalid Todo Status");
  } else if (
    priority !== "MEDIUM" &&
    priority !== "HIGH" &&
    priority !== "LOW" &&
    priority !== undefined
  ) {
    response.status(400);
    response.send("Invalid Todo Priority");
  } else if (
    category !== "WORK" &&
    category !== "HOME" &&
    category !== "LEARNING" &&
    category !== undefined
  ) {
    response.status(400);
    response.send("Invalid Todo Category");
  } else if (isValidDate === false && dueDate !== undefined) {
    response.status(400);
    response.send("Invalid Due Date");
  } else {
    next();
  }
};

// Get Todo list

app.get("/todos/", checkingScenario, async (request, response) => {
  const { status, priority, category, search_q, date } = request.query;

  let getTodosQuery;

  if (status !== undefined) {
    getTodosQuery = `
    SELECT id,todo,priority,status,category,due_date AS dueDate 
    FROM todo 
    WHERE  status = "${status}";`;
  } else if (priority !== undefined) {
    getTodosQuery = `
    SELECT id,todo,priority,status,category,due_date AS dueDate 
    FROM todo 
    WHERE  priority = "${priority}";`;
  } else if (category !== undefined) {
    getTodosQuery = `
    SELECT id,todo,priority,status,category,due_date AS dueDate 
    FROM todo 
    WHERE  category = "${category}";`;
  } else if (search_q !== undefined) {
    getTodosQuery = `
    SELECT id,todo,priority,status,category,due_date AS dueDate 
    FROM todo 
    WHERE  todo LIKE "%${search_q}%";`;
  }

  if (priority !== undefined && status !== undefined) {
    getTodosQuery = `
    SELECT id,todo,priority,status,category,due_date AS dueDate 
    FROM todo 
    WHERE  status = "${status}" AND priority = "${priority}" ;`;
  } else if (category !== undefined && status !== undefined) {
    getTodosQuery = `
    SELECT id,todo,priority,status,category,due_date AS dueDate 
    FROM todo 
    WHERE  status = "${status}" AND category = "${category}" ;`;
  } else if (category !== undefined && priority !== undefined) {
    getTodosQuery = `
    SELECT id,todo,priority,status,category,due_date AS dueDate 
    FROM todo 
    WHERE  priority = "${priority}" AND category = "${category}" ;`;
  }

  const getTodosList = await db.all(getTodosQuery);
  response.send(getTodosList);
});

app.get("/todos/", checkingScenario, async (request, response) => {
  const getTodosQuery = `SELECT * FROM todo;`;
  const getTodos = await db.all(getTodosQuery);
  response.send(getTodos);
});

// Specific Todo
app.get("/todos/:todoId", checkingScenario, async (request, response) => {
  const { todoId } = request.params;
  const selectedTodoQuery = `
    SELECT 
    id,
    todo,
    priority,
    status,
    category,
    due_date AS dueDate 
    FROM todo 
    WHERE id = ${todoId};`;

  const getTodo = await db.get(selectedTodoQuery);
  response.send(getTodo);
});

// GET Todo Based On Date
app.get("/agenda/", checkingScenario, async (request, response) => {
  const { date } = request.query;
  const formattedDate = format(new Date(date), "yyyy-MM-dd");

  const getTodoQuery = `
    SELECT 
    id,
    todo,
    priority,
    status,
    category,
    due_date AS dueDate
    FROM todo 
    WHERE due_date = "${formattedDate}";`;

  const todoDetails = await db.get(getTodoQuery);
  response.send(todoDetails);
});

// Create Todo
app.post("/todos/", checkingScenario2, async (request, response) => {
  const { id, todo, priority, status, category, dueDate } = request.body;

  const addTodoQuery = `
    INSERT INTO 
     todo(id,todo,priority,status,category,due_date)
    VALUES
    (${id},"${todo}","${priority}","${status}","${category}","${dueDate}");`;

  await db.run(addTodoQuery);
  response.send("Todo Successfully Added");
});

//UPDATE TODO Status
app.put("/todos/:todoId/", checkingScenario2, async (request, response) => {
  const { todoId } = request.params;
  const { status, priority, todo, category, dueDate } = request.body;

  let updateTodoQuery;
  let responseText = "";

  if (status !== undefined) {
    updateTodoQuery = `
    UPDATE todo 
    SET status ="${status}"
    WHERE id = ${todoId};`;

    responseText = "Status Updated";
  } else if (priority !== undefined) {
    updateTodoQuery = `
    UPDATE todo 
    SET priority ="${priority}"
    WHERE id = ${todoId};`;
    responseText = "Priority Updated";
  } else if (todo !== undefined) {
    updateTodoQuery = `
      UPDATE todo 
      SET todo ="${todo}"
      WHERE id = ${todoId};`;
    responseText = "Todo Updated";
  } else if (category !== undefined) {
    updateTodoQuery = `
    UPDATE todo 
    SET category ="${category}"
    WHERE id = ${todoId};`;
    responseText = "Category Updated";
  } else if (dueDate !== undefined) {
    updateTodoQuery = `
    UPDATE todo 
    SET due_date ="${dueDate}"
    WHERE id = ${todoId};`;
    responseText = "Due Date Updated";
  }

  await db.run(updateTodoQuery);
  response.send(responseText);
});

// Update Todo Priority
app.put("/todos/:todoId/", checkingScenario2, async (request, response) => {
  const { todoId } = request.params;
  const { priority } = request.body;

  const updateTodoQuery = `
    UPDATE todo 
    SET priority ="${priority}"
    WHERE id = ${todoId};`;

  await db.run(updateTodoQuery);
  response.send("priority Updated");
});

//DELETE Todo
app.delete("/todos/:todoId", async (request, response) => {
  const { todoId } = request.params;
  const deleteTodoQuery = `
    DELETE FROM todo 
    WHERE id = ${todoId};`;

  await db.run(deleteTodoQuery);
  response.send("Todo Deleted");
});
module.exports = app;
