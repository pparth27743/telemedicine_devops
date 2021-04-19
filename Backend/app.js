require("dotenv").config();
const express = require("express");
const cors = require('cors')

const userRouter = require("./users/user.router");

const app = express();

app.use(cors());  
app.use(express.json());
app.use("/api/users", userRouter);


const port = process.env.APP_PORT || 3000;
app.listen(port, () => {
  console.log("server up and running on PORT :", port);
});