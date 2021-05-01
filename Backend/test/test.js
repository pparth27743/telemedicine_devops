// const app = require('../app');

// const request = require('supertest');
// const logger = require('../logger');
// const baseUrl = 'http://localhost:3000/api/users';

// let token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyZXN1bHQiOnsiaWQiOjUsImZpcnN0bmFtZSI6ImZpcnN0bmFtZSIsImxhc3RuYW1lIjoibGFzdG5hbWUiLCJlbWFpbCI6ImVtYWlsMUBnbWFpbC5jb20ifSwiaWF0IjoxNjE5NzgyOTkwLCJleHAiOjE2MTk4MDA5OTB9.Zsh_ZrMMiaWFl59WFUEfTEueFA2ngcQ3_t2WrYLeBn4';
// let id = 5;

// // Signup
// describe('\n\n\n\nSignup ::', () => {

//     it('Create User Success\n\n', (done) => {
//         request(baseUrl)
//             .post('/signup')
//             .send({
//                 firstname: 'firstname ',
//                 lastname: 'lastname',
//                 email: 'email@gmail.com',
//                 password: 'password'
//             })
//             .end((err, res) => {
//                 if (res.body.success === 0) {
//                     logger.error(err);
//                     throw err;
//                 };
//                 if (res.body.success === 1) {
//                     console.log(res.body);
//                     logger.info(res.body);
//                 };

//                 done();
//             });
//     })


//     it('Failed to signup \n\n', (done) => {
//         request(baseUrl)
//             .post('/signup')
//             .send({
//                 firstname: 'firstname',
//                 lastname: 'lastname',
//                 email: 'email@gmail.com',
//                 password: 'password'
//             })
//             .end((err, res) => {
//                 if (res.body.success === 1) {
//                     logger.error(err);
//                     throw err;
//                 };
//                 if (res.body.success === 0) {
//                     console.log(res.body);
//                     logger.info(res.body);
//                 };
//                 done();
//             });
//     })

// });

// // Login
// describe('\n\n\n\nLogin test :: ', () => {

//     it('not able log in \n\n', (done) => {
//         request(baseUrl)
//             .post('/login')
//             .send({
//                 email: 'alay@gmail.com',
//                 password: 'alay@1234'
//             })
//             .end((err, res) => {
//                 if (res.body.success === 1) {
//                     logger.error(err);
//                     throw err;
//                 };
//                 if (res.body.success === 0) {
//                     console.log(res.body);
//                     logger.info(res.body);
//                 };
//                 done();
//             });
//     })

//     it('should be able to login \n\n', (done) => {
//         request(baseUrl)
//             .post('/login')
//             .send({
//                 email: 'email@gmail.com',
//                 password: 'password'
//             })
//             .end((err, res) => {
//                 if (res.body.success === 0) {
//                     logger.error(err);
//                     throw err;
//                 };
//                 if (res.body.success === 1) {
//                     console.log(res.body);
//                     logger.info(res.body);
//                     token = res.body.currentUser.token;
//                     id = res.body.currentUser.id;
//                 };
//                 done();
//             });
//     })
// });

// // Get all users
// describe('\n\n\n\nGet all user :: ', () => {
//     it('Fetch all the users\n\n', (done) => {

//         request(baseUrl)
//             .get('/getallusers')
//             .set('Authorization', `Bearer ${token}`)
//             .end((err, res) => {
//                 if (res.body.success === 0) {
//                     logger.error(err);
//                     throw err;
//                 };
//                 if (res.body.success === 0) {
//                     console.log(res.body);
//                     logger.info(res.body);
//                 };
//                 done();
//             });
//     })
// });


// // Delete users
// describe('\n\n\n\nDelete User ::', () => {
//     it('Delete User Success\n\n', (done) => {
//         request(baseUrl)
//             .delete('/')
//             .set('Authorization', `Bearer ${token}`)
//             .send({
//                 id: `${id}`,
//             })
//             .end((err, res) => {
//                 if (res.body.success === 0) {
//                     logger.error(err);
//                     throw err;
//                 };
//                 if (res.body.success === 1) {
//                     console.log(res.body);
//                     logger.info(res.body)
//                 };
//                 done();
//             });
//     })
// });




const app = require('../app');

// const chai = require('chai');
// const chaiHttp = require('chai-http');
// const should = chai.should();
// chai.use(chaiHttp);

const request = require('supertest');
const baseUrl = 'http://localhost:3000/api/users';

let token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyZXN1bHQiOnsiaWQiOjUsImZpcnN0bmFtZSI6ImZpcnN0bmFtZSIsImxhc3RuYW1lIjoibGFzdG5hbWUiLCJlbWFpbCI6ImVtYWlsMUBnbWFpbC5jb20ifSwiaWF0IjoxNjE5NzgyOTkwLCJleHAiOjE2MTk4MDA5OTB9.Zsh_ZrMMiaWFl59WFUEfTEueFA2ngcQ3_t2WrYLeBn4';
let id = 5;

// Signup
describe('\n\n\n\nSignup ::', () => {

    it('Create User Success\n\n', (done) => {
        request(baseUrl)
            .post('/signup')
            .send({
                firstname: 'firstname ',
                lastname: 'lastname',
                email: 'email@gmail.com',
                password: 'password'
            })
            .end((err, res) => {
                if (res.body.success === 0) throw err;
                if (res.body.success === 1) console.log(res.body);

                done();
            });
    })


    it('Failed to signup \n\n', (done) => {
        request(baseUrl)
            .post('/signup')
            .send({
                firstname: 'firstname',
                lastname: 'lastname',
                email: 'email@gmail.com',
                password: 'password'
            })
            .end((err, res) => {
                if (res.body.success === 1) throw err;
                if (res.body.success === 0) console.log(res.body);
                done();
            });
    })

});

// Login
describe('\n\n\n\nLogin test :: ', () => {

    it('not able log in \n\n', (done) => {
        request(baseUrl)
            .post('/login')
            .send({
                email: 'alay@gmail.com',
                password: 'alay@1234'
            })
            .end((err, res) => {
                if (res.body.success === 1) throw err;
                if (res.body.success === 0) console.log(res.body);
                done();
            });
    })

    it('should be able to login \n\n', (done) => {
        request(baseUrl)
            .post('/login')
            .send({
                email: 'email@gmail.com',
                password: 'password'
            })
            .end((err, res) => {
                if (res.body.success === 0) throw err;
                if (res.body.success === 1) {
                    console.log(res.body);
                    token = res.body.currentUser.token;
                    id = res.body.currentUser.id;
                };
                done();
            });
    })
});

// Get all users
describe('\n\n\n\nGet all user :: ', () => {
    it('Fetch all the users\n\n', (done) => {

        request(baseUrl)
            .get('/getallusers')
            .set('Authorization', `Bearer ${token}`)
            .end((err, res) => {
                if (res.body.success === 0) throw err;
                if (res.body.success === 0) console.log(res.body);
                done();
            });
    })
});


// Delete users
describe('\n\n\n\nDelete User ::', () => {
    it('Delete User Success\n\n', (done) => {
        request(baseUrl)
            .delete('/')
            .set('Authorization', `Bearer ${token}`)
            .send({
                id: `${id}`,
            })
            .end((err, res) => {
                if (res.body.success === 0) throw err;
                if (res.body.success === 1) console.log(res.body);
                done();
            });
    })
});










