const app = require('../webrtc-server');

const request = require('supertest');
const baseUrl = 'http://localhost:4440';

let roomId = '123';


// Get Client Id
describe('\n\nGet Client Id:: ', () => {
    it('Get Client Id \n', (done) => {

        request(baseUrl)
            .get('/clientId')
            .end((err, res) => {
                if (!res.body['client-id']) throw err;
                else console.log(res.body);
                done();
            });
    })
});


// Get Room Id
describe('\n\nGet Room Id:: ', () => {
    it('Get Room Id \n', (done) => {

        request(baseUrl)
            .get('/createRoom')
            .end((err, res) => {
                if (!res.body['room-id']) throw err;
                else {
                    console.log(res.body);
                    roomId = res.body['room-id'];
                };
                done();
            });
    })
});

// Join Room
describe('\n\nJoin Room :: ', () => {

    it('Join Room with given Id \n', (done) => {
        request(baseUrl)
            .get(`/joinRoom?roomId=${roomId}`)
            .end((err, res) => {
                console.log(res.body);
                done();
            });
    })
});




