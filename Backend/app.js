const logger = require('./logger')
require("dotenv").config();
const express = require("express");
const cors = require('cors');
const userRouter = require("./users/user.router");


const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/users", userRouter);


const mysql = require('mysql');
const con = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PWD
});


// Create database and table if not exists.
con.connect(function (err) {
  if (err) throw err;

  con.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.MYSQL_DB}\``, function (err, result) {
    if (err) throw err;
  });

  stmt = `CREATE TABLE IF NOT EXISTS \`${process.env.MYSQL_DB}\`.\`user_doctor\` (` +
  "`id` INT NOT NULL AUTO_INCREMENT," +
  "`firstname` VARCHAR(45) NOT NULL," +
  "`lastname` VARCHAR(45) NULL," +
  "`email` VARCHAR(45) NOT NULL," +
  "`password` VARCHAR(100) NOT NULL," +
  "`namespace_id` VARCHAR(45) NOT NULL," +
  "`specialization` ENUM ('Cardiologist', 'Dermatologist', 'General Medicine (MD)', 'Dentist', 'Gynecologist', 'Neurologist',  'Physiotherapist', 'Orthopedic') NOT NULL," +
  "PRIMARY KEY (`id`)," +
  "UNIQUE INDEX `namespace_id_UNIQUE` (`namespace_id` ASC) VISIBLE," +
  "UNIQUE INDEX `id_UNIQUE` (`id` ASC) VISIBLE," +
  "UNIQUE INDEX `email_UNIQUE` (`email` ASC) VISIBLE)";

  con.query(stmt, function (err, result) {
    if (err) throw err;
  });

  stmt = `CREATE TABLE IF NOT EXISTS \`${process.env.MYSQL_DB}\`.\`user_patient\` (` +
  "`id` INT NOT NULL AUTO_INCREMENT," +
  "`firstname` VARCHAR(45) NOT NULL," +
  "`lastname` VARCHAR(45) NULL," +
  "`email` VARCHAR(45) NOT NULL," +
  "`password` VARCHAR(100) NOT NULL," +
  "PRIMARY KEY (`id`)," +
  "UNIQUE INDEX `id_UNIQUE` (`id` ASC) VISIBLE," +
  "UNIQUE INDEX `email_UNIQUE` (`email` ASC) VISIBLE )";

  con.query(stmt, function (err, result) {
    if (err) throw err;
  });


  stmt = `CREATE TABLE IF NOT EXISTS \`${process.env.MYSQL_DB}\`.\`pending_calls\` (` +
    "`id` INT NOT NULL AUTO_INCREMENT," +
    "`roomid` VARCHAR(45) NOT NULL," +
    "PRIMARY KEY (`id`)," +
    "CONSTRAINT `doctor_id` " +
      "FOREIGN KEY (`id`) "+
      "REFERENCES `telemedicine`.`user_doctor` (`id`) " +
      "ON DELETE CASCADE " +
      "ON UPDATE CASCADE, " +
    "CONSTRAINT `patient_id` " +
      "FOREIGN KEY (`id`) " +
      "REFERENCES `telemedicine`.`user_patient` (`id`) " +
      "ON DELETE CASCADE " +
      "ON UPDATE CASCADE )";

      con.query(stmt, function (err, result) {
        if (err) throw err;
      });
    

});

const port = process.env.APP_PORT || 3000;
app.listen(port, () => {
  console.log(`Backend up and running on PORT : ${port}`);
});







