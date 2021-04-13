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

module.exports = {
    createUser: async (req, res) => {
        const body = req.body;

        const salt = genSaltSync(10);
        body.password = hashSync(body.password, salt);

        create(body, (err, results) => {
            if (err) {
                return res.json({
                    success: 0,
                    message: "Database connection errror or Email already exits.",
                    error: err['sqlMessage']
                });
            }
            if (results) {
                return res.json({
                    success: 1,
                    message: "Signup Successfully.",
                    data: results
                });
            }
        });
    },
    login: (req, res) => {
        const body = req.body;

        getUserByUserEmail(body.email, (err, results) => {
            if (err) {
                console.log(err);
            }
            if (!results) {
                return res.json({
                    success: 0,
                    data: "Invalid email or password"
                });
            }
            const result = compareSync(body.password, results.password);
            if (result) {
                results.password = undefined;
                const jsontoken = sign({ result: results }, process.env.JWT_KEY, {
                    expiresIn: "5h"
                });
                return res.json({
                    success: 1,
                    message: "login successfully",
                    currentUser: {
                        ...results,
                        token: jsontoken,
                    }
                });
            } else {
                return res.json({
                    success: 0,
                    message: "Invalid email or password"
                });
            }
        });
    },
    getUserByUserId: (req, res) => {
        const id = req.params.id;
        getUserByUserId(id, (err, results) => {
            if (err) {
                console.log(err);
                return;
            }
            if (!results) {
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
                console.log(err);
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
        body.password = hashSync(body.password, salt);
        updateUser(body, (err, results) => {
            if(err) {
                return res.json({
                    success: 0,
                    message: "fail to update the data.",
                    error: err['sqlMessage']
                });
            }
            if(results){
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
            console.log("result ::: " + results);
            if (err) {
                console.log(err);
                return;
            }
            if (!results) {
                return res.json({
                    success: 0,
                    message: "Record Not Found"
                });
            }
            return res.json({
                success: 1,
                message: "user deleted successfully"
            });
        });
    }
};