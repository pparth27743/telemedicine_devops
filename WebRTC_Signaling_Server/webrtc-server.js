// create http server
const app = require('express')();
const cors = require('cors');
app.use(cors());
const httpServer = require("http").createServer(app);

const io = require("socket.io")(httpServer, {
    cors: {
        origin: "*",              // origin: ["http://192.168.0.106:4200", "http://localhost:4200"],
        methods: ["GET", "POST"]
    }
});

// Import uniqid and uuid
const { v4: uuidv4 } = require('uuid');
const uniqid = require('uniqid');


// routes
app.get('/clientId', (req, res) => {
    return res.json({
        'client-id': uniqid('cli-')
    });
});

app.get('/createRoom', (req, res) => {
    // let newUUID = uuidv4();
    let newUUID = '123';
    return res.json({
        'room-id': newUUID
    });
});

app.get('/joinRoom', (req, res) => {
    let roomId = req.query['roomId'];
    if (io.sockets.adapter.rooms.has(roomId) === true) {
        return res.json({
            'status': 200,
            'msg': 'Congo!!! This room is available.'
        });
    }
    else {
        return res.json({
            'status': 400,
            'error': 'No Room with such an ID'
        });
    }
});


// sokcet listen and emmiter 
io.on('connect', (socket) => {

    console.log(`Socket ${socket.id} has connected`);

    socket.on('join', (data) => {
        if (io.sockets.adapter.rooms.has(data['room-id']) === true) {
            socket.join(data['room-id']);
            socket.broadcast.in(data['room-id']).emit('room-joined', data);
        }
        else {
            socket.join(data['room-id']);
        }
    });

    socket.on('send-metadata', (data) => {
        socket.broadcast.in(data['room-id']).emit('send-metadata', data);
    });

    socket.on('ice-candidate', (data) => {
        socket.broadcast.in(data['room-id']).emit('ice-candidate', data);
    });

    socket.on('offer', (data) => {
        socket.broadcast.in(data['room-id']).emit('offer', data);
    });

    socket.on('answer', (data) => {
        socket.broadcast.in(data['room-id']).emit('answer', data);
    });
});



// run http server
const port = 4440;
httpServer.listen(port, () => {
    console.log('Webrtc Server is Listening on port ' + port);
});
