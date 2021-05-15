const pool = require("../database/db");
const { nanoid } = require('nanoid');

module.exports = {
    create: (data, callBack) => {
        if (data.role === 'Doctor') {
            let namespace_id = nanoid(16);
            pool.query(
                `insert into ${process.env.MYSQL_DB}.\`user_doctor\`(firstName, lastName, email, password, namespace_id, specialization) 
                        values(?,?,?,?,?,?)`,
                [
                    data.firstname,
                    data.lastname,
                    data.email,
                    data.password,
                    namespace_id,
                    data.specialization
                ],
                (error, results, fields) => {
                    if (error) {
                        callBack(error);
                    }
                    return callBack(null, results);
                }
            );
        } else {
            pool.query(
                `insert into ${process.env.MYSQL_DB}.\`user_patient\`(firstName, lastName, email, password) 
                values(?,?,?,?)`,
                [
                    data.firstname,
                    data.lastname,
                    data.email,
                    data.password
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
    getUserByUserEmail: async (data, callBack) => {
        if (data.role === "Doctor") {
            pool.query(
                `select * from ${process.env.MYSQL_DB}.\`user_doctor\` where email = ?`,
                [data.email],
                (error, results, fields) => {
                    if (error) {
                        callBack(error);
                    }
                    return callBack(null, results[0]);
                }
            );
        } else {
            pool.query(
                `select * from ${process.env.MYSQL_DB}.\`user_patient\` where email = ?`,
                [data.email],
                (error, results, fields) => {
                    if (error) {
                        callBack(error);
                    }
                    return callBack(null, results[0]);
                }
            );
        }
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
    getDoctorsBySpecialization: (specialization, callBack) => {
        pool.query(
            `select id, firstName, lastName, namespace_id from ${process.env.MYSQL_DB}.user_doctor where specialization = ?`,
            [specialization],
            (error, results, fields) => {
                if (error) {
                    callBack(error);
                }
                return callBack(null, results);
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
        console.log(data);

        // If user is doctor
        if (data.role === 'Doctor') {
            // If password also needs to be changed.
            if (data.password) {
                pool.query(
                    `update ${process.env.MYSQL_DB}.user_doctor set firstName=?, lastName=?, email=?, password=?, specialization=? where id = ?`,
                    [
                        data.firstname,
                        data.lastname,
                        data.email,
                        data.password,
                        data.specialization,
                        data.id,
                    ],
                    (error, results, fields) => {
                        if (error) {
                            callBack(error);
                        }
                        return callBack(null, results);
                    }
                );
            }
            else {
                pool.query(
                    `update ${process.env.MYSQL_DB}.user_doctor set firstName=?, lastName=?, email=?, specialization=? where id = ?`,
                    [
                        data.firstname,
                        data.lastname,
                        data.email,
                        data.specialization,
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
        } 
        else {   // If user is patient
            // If password also needs to be changed.
            if (data.password) {
                pool.query(
                    `update ${process.env.MYSQL_DB}.user_patient set firstName=?, lastName=?, email=?, password=? where id = ?`,
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
            else {
                pool.query(
                    `update ${process.env.MYSQL_DB}.user_patient set firstName=?, lastName=?, email=? where id = ?`,
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