const express = require("express");
const app = express();
const mongodb = require("mongodb");
const mongoClient = mongodb.MongoClient;
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();
const URL = process.env.URL;

const PORT = process.env.PORT || 3066;
const cors = require("cors");

app.use(cors({}));
app.use(express.json());

// function auth(req, res, next) {
//   if (req.headers.authorization) {
//     let decode = jwt.verify(req.headers.authorization, "secretkey");
//     if (decode) {
//       req.userId = decode.id;
//       next();
//     } else {
//       res.status(401).json({ message: "Unauthorized" });
//     }
//   } else {
//     res.status(401).json({ message: "Unauthorized" });
//   }
// }
app.get("/", (req, res) => {
  res.json({ messege: "backend sucess" });
});

// Register

app.post("/register", async (req, res) => {
  try {
    let connection = await mongoClient.connect(URL);

    let db = connection.db("shop");
    let salt = bcrypt.genSaltSync(10);
    let hash = bcrypt.hashSync(req.body.password, salt);
    req.body.password = hash;

    await db.collection("users").insertOne(req.body);

    await connection.close();

    res.json({ messege: "User Added" });
  } catch (error) {
    res.status(500).json({ messege: "error" });
    console.log(error);
  }
});

// log in
app.post("/login", async (req, res) => {
  try {
    let connection = await mongoClient.connect(URL);
    let db = connection.db("shop");
    let user = await db.collection("users").findOne({ email: req.body.email });
    if (user) {
      let compare = bcrypt.compareSync(req.body.password, user.password);
      if (compare) {
        let token = jwt.sign({ name: user.name, id: user._id }, "shop");
        res.json({ token });
      } else {
        res.status(500).json({ messege: "creditionals error" });
      }
    } else {
      res.status(500).json({ messege: "creditionals error" });
    }
    await connection.close();
  } catch (error) {
    res.status(500).json({ messege: "error" });
    console.log(error);
  }
});

// get user

// app.get("/home", async (req, res) => {
//   try {
//     let connection = await mongoClient.connect(URL);

//     let db = connection.db("sample");

//     let datas = await db.collection("users").find().toArray();

//     await connection.close();

//     res.json(datas);
//   } catch (error) {
//     res.status(500).json({ messege: "error" });
//   }
// });

app.listen(PORT, () => {
  console.log(`server start ${PORT}`);
});
