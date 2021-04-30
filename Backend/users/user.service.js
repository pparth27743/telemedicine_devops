const pool = require("../database/db");

module.exports = {
    create: (data, callBack) => {
        pool.query(
            `insert into ${process.env.MYSQL_DB}.users(firstName, lastName, email, password, role) 
                values(?,?,?,?,?)`,
            [
                data.firstname,
                data.lastname,
                data.email,
                data.password,
                data.role
            ],
            (error, results, fields) => {
                if (error) {
                    callBack(error);
                }
                return callBack(null, results);
            }
        );
    },
    getUserByUserEmail: async (email, callBack) => {
        pool.query(
            `select * from ${process.env.MYSQL_DB}.users where email = ?`,
            [email],
            (error, results, fields) => {
                if (error) {
                    callBack(error);
                }
                return callBack(null, results[0]);
            }
        );
    },
    getUserByUserId: (id, callBack) => {
        pool.query(
            `select id,firstName,lastName,email,role from ${process.env.MYSQL_DB}.users where id = ?`,
            [id],
            (error, results, fields) => {
                if (error) {
                    callBack(error);
                }
                return callBack(null, results[0]);
            }
        );
    },
    getUsers: callBack => {
        pool.query(
            `select id,firstName,lastName,email,role from ${process.env.MYSQL_DB}.users`,
            [],
            (error, results, fields) => {
                if (error) {
                    callBack(error);
                }
                return callBack(null, results);
            }
        );
    },
    updateUser: (data, callBack) => {
            
        // If password also needs to be changed.
            if(data.password){
            pool.query(
                `update ${process.env.MYSQL_DB}.users set firstName=?, lastName=?, email=?, password=? where id = ?`,
                [
                    data.firstname,
                    data.lastname,
                    data.email,
                    data.password,
                    data.id
                ],
                (error, results, fields) => {
                    if (error) {
                        callBack(error);
                    }
                    return callBack(null, results);
                }
            );
            }
            else{
            pool.query(
                `update ${process.env.MYSQL_DB}.users set firstName=?, lastName=?, email=? where id = ?`,
                [
                    data.firstname,
                    data.lastname,
                    data.email,
                    data.id
                ],
                (error, results, fields) => {
                    if (error) {
                        callBack(error);
                    }
                    return callBack(null, results);
                }
            );
            }
    },
    deleteUser: (data, callBack) => {
        pool.query(
            `delete from ${process.env.MYSQL_DB}.users where id = ?`,
            [data.id],
            (error, results, fields) => {
                if (error) {
                    callBack(error);
                }
                return callBack(null, results);
            }
        );
    }
};