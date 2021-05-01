const {
    create,
    getUserByUserEmail,
    getUserByUserId,
    getUsers,
    updateUser,
    deleteUser
} = require("./user.service");
const { hashSync, genSaltSync, compareSync } = require("bcrypt");
const { sign } = require("jsonwebtoken");
const logger = require("../logger");

module.exports = {
    validateUser: (req, res) => {
        return res.json({
            success: 1,
            message: "Valid Token...",
            validtoken: 1
        });
    },
    createUser: (req, res) => {
        const body = req.body;

        const salt = genSaltSync(10);
        body.password = hashSync(body.password, salt);

        create(body, (err, results) => {
            if (err) {
                logger.error(err);
                return res.json({
                    success: 0,
                    message: "Database connection errror or Email already exits.",
                    error: err['sqlMessage']
                });
            }
            if (results) {
                logger.info("Signup Successfully.");
                return res.json({
                    success: 1,
                    message: "Signup Successfully.",
                    data: results,
                });
            }
        });
    },
    login: (req, res) => {
        const body = req.body;
        getUserByUserEmail(body.email, (err, results) => {
            if (err) {
                logger.error(err);
            }
            if (!results) {
                logger.warn("No such user exist");
                return res.json({
                    success: 0,
                    message: "No such user exist"
                });
            }
            const result = compareSync(body.password, results.password) && (body.role == results.role);
            if (result) {
                results.password = undefined;
                const jsontoken = sign({ result: results }, process.env.JWT_KEY, {
                    expiresIn: "5h"
                });
                logger.info("login successfully");
                return res.json({
                    success: 1,
                    message: "login successfully",
                    currentUser: {
                        ...results,
                        token: jsontoken,
                    }
                });
            } else {
                logger.warn("Invalid email or password or role");
                return res.json({
                    success: 0,
                    message: "Invalid email or password or role"
                });
            }
        });
    },
    getUserByUserId: (req, res) => {
        const id = req.params.id;
        getUserByUserId(id, (err, results) => {
            if (err) {
                logger.error(err);
                return;
            }
            if (!results) {
                logger.warn("Record not Found");
                return res.json({
                    success: 0,
                    message: "Record not Found"
                });
            }
            results.password = undefined;
            return res.json({
                success: 1,
                data: results
            });
        });
    },
    getUsers: (req, res) => {
        getUsers((err, results) => {
            if (err) {
                logger.error(err);
                return;
            }
            return res.json({
                success: 1,
                data: results
            });
        });
    },
    updateUsers: (req, res) => {
        const body = req.body;
        const salt = genSaltSync(10);
        if (body.password) {
            body.password = hashSync(body.password, salt);
        }
        updateUser(body, (err, results) => {
            if (err) {
                logger.warn("fail to update the data.");
                return res.json({
                    success: 0,
                    message: "fail to update the data.",
                    error: err['sqlMessage']
                });
            }
            if (results) {
                logger.info("updated successfully");
                return res.json({
                    success: 1,
                    message: "updated successfully",
                    data: results
                });
            }
        });
    },
    deleteUser: (req, res) => {
        const data = req.body;
        deleteUser(data, (err, results) => {
            if (err) {
                logger.error(err);
                return;
            }
            if (!results) {
                logger.warn("Record Not Found");
                return res.json({
                    success: 0,
                    message: "Record Not Found"
                });
            }
            logger.info("user deleted successfully");
            return res.json({
                success: 1,
                message: "user deleted successfully"
            });
        });
    }
};