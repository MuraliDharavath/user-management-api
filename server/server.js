const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "database.db");

let db = null;
console.log("DIR:", __dirname);
console.log("DB PATH:", dbPath);

//initialization database and server
const InitializationServerandDb = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    //crating table
    await db.exec(`
            CREATE TABLE IF NOT EXISTS  users(
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT,
                email TEXT,
                age INTEGER
            )`);

    app.listen(3000, () => {
      console.log(`Server is runnig at http://localhost:3000`);
    });
  } catch (error) {
    console.log(`DB Error : ${error.message}`);
    process.exit(1);
  }
};

InitializationServerandDb();

//creating a new user
app.post("/users", async (req, res) => {
  const { name, email, age } = req.body;

  // validation

  if (!name || !email || !age) {
    return res.status(400).send("All fields are required");
  }

  const UserQuery = `
  INSERT INTO users ( name, email, age)
  VALUES( ?, ?, ?)`;

  await db.run(UserQuery);

  res.status(200).send("User created successfully");
});

//get all the users
app.get("/users", async (req, res) => {
  const { search = "", sort = "id", order = "ASC" } = req.query;
  const GetUsersQuery = `
    SELECT * FROM users
    WHERE name LIKE "%${search}"
    ORDER BY ${sort} ${order}; `;

  await db.get(GetUsersQuery);
  res.status(200).send("All Users !");
});

app.get("/users/:id", async (req, res) => {
  const { id } = req.params;

  const UserDetialsQuery = `
     SELECT * FROM 
     users
     WHERE id= ${id}`;

  const Details = await db.run(UserDetialsQuery);

  res.status(200).send(Details);
});

app.delete("/users/:id", async (req, res) => {
  const { id } = req.params;

  const DeleteQuery = `
    DELETE FROM users
    WHERE id= ${id}`;

  await db.run(DeleteQuery);

  res.send("User Deleted Successfully !");
});

app.put("/users/:id", async (req, res) => {
  const { name, email, age } = req.body;
  const { id } = req.params;

  const updateQuery = `
    UPDATE users
    SET name = ?, email = ?, age = ?
    WHERE id = ?
  `;

  const result = await db.run(updateQuery, [name, email, age, id]);

  if (result.changes === 0) {
    return res.status(404).send("User not found");
  }

  res.send("User Details Updated Successfully!");
});
