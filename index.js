var express = require('express');
var socket = require('socket.io');
var http = require('http');


var app = express();
var server = http.Server(app);
var io = socket(server);

//static client page
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/public/index.html');
});

//server setup
server.listen(3000, function () {
    console.log('listening on port: 3000');
});


// Chat room

var numUsers = 0;
var numClient = 0;
var typing = false;

io.on('connection', (socket) => {
    var addedUser = false;
    numClient++;
    console.log(numClient + ' Client is here');

    //When client emits 'add user' event, this listens and executes
    socket.on('add user', (username) => {
        //if true then return (only true if the user is already added)
        if (addedUser) return;

        //adding username in the socket session
        socket.username = username;
        ++numUsers;
        addedUser = true;
        console.log(numUsers + ' user online \n' + socket.username + ' is online.');
        socket.emit('welcome', numUsers);

        
        socket.broadcast.emit('user joined', {
            numUsers: numUsers,
            username: socket.username
        })
    })

    socket.on('disconnect', () => {
        numClient--;
        console.log(numClient + ' Client is here');

        if (addedUser) {
            --numUsers;
            addedUser = false;
            
            socket.broadcast.emit('user left', {
                numUsers: numUsers,
                username: socket.username
            })
        }
    });

    //when client emits 'new message', this listens and executes
    socket.on('new message', (message) => {

        console.log(message);
        socket.broadcast.emit('new message', {
            username: socket.username,
            message: message
        });
        typing = false;

    });

    socket.on('typing', () => {
        if (!typing) {
            socket.broadcast.emit('typing', socket.username);
            typing = true;

        }
    });

    socket.on('stopped typing', () => {
        socket.broadcast.emit('stopped typing');
        typing = false;
    })
});