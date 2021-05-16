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


const namespaces = {};
const socket_namespace = {};


// routes
app.get('/createRoom', (req, res) => {
    let newUUID = uuidv4();
    // let newUUID = '123';
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

app.get('/createNamespace', (req, res) => {
    let namespace_id = req.query['namespace_id'];
    if (io._nsps.has(`/${namespace_id}`) === true) {
        return res.json({
            'status': 200,
            'msg': 'Namespeace already exists.'
        });
    } 
    else {
        const namespace = io.of(`/${namespace_id}`);
        namespace.on('connect', socketHandler);
        namespaces[namespace_id] = namespace;
        return res.json({
            'status': 200,
            'msg': 'Namespace added successfully.'
        });
    }
});

app.get('/removeNamespace', (req, res) => {
    let namespace_id = req.query['namespace_id'];
    delete namespaces[namespace_id];
    delete socket_namespace[namespace_id];
    io._nsps.delete(`/${namespace_id}`);
    return res.json({
        'status': 200,
        'msg': 'Namespace removed successfully'
    });
});

app.get('/checkAvailability', (req, res) => {
    let namespace_id = req.query['namespace_id'];
    if(socket_namespace[namespace_id]){
        return res.json({
            'status': 200,
            'msg': 'Doctor is available',
            'availability': true
        });
    }else{
        return res.json({
            'status': 200,
            'msg': 'Doctor is not available',
            'availability': false
        });
    }
});


function socketHandler(socket) {

    console.log(`Socket ${socket.id} has connected`);

    socket.on('doctor-joined', (data) => {
        socket_namespace[data['namespace-id']] = data['client-id'];
    });

    socket.on('join', (data) => {
        
        console.log(socket.nsp.name);
        
        console.log(io._nsps.get(socket.nsp.name).adapter.rooms.has(data['room-id']));
        console.log(data['room-id']);

        if (io._nsps.get(socket.nsp.name).adapter.rooms.has(data['room-id']) === true) {
            console.log("joined");
            socket.join(data['room-id']);
            socket.broadcast.in(data['room-id']).emit('room-joined', data);
        }
    });

    socket.on('create', (data) => {
        socket.join(data['room-id']);

        console.log(io._nsps.get(socket.nsp.name).adapter.rooms);

        const doc_socket_id = socket_namespace[socket.nsp.name.slice(1)];
        if(doc_socket_id){
            socket.to(doc_socket_id).emit('new-patient', data);
        }
    });
    

    socket.on('send-metadata', (data) => {
        socket.to(data['peer-id']).emit('send-metadata', data);
    });

    socket.on('ice-candidate', (data) => {
        socket.to(data['peer-id']).emit('ice-candidate', data);
    });

    socket.on('offer', (data) => {
        socket.to(data['peer-id']).emit('offer', data);
    });

    socket.on('answer', (data) => {
        socket.to(data['peer-id']).emit('answer', data);
    });

    socket.on('disconnect', (reason) => {
        socket.broadcast.emit('client-disconnected', { 'client-id': socket.id });
    });
}

// run http server
const port = 4440;
httpServer.listen(port, () => {
    console.log('Webrtc Server is Listening on port ' + port);
});
