var path = require('path');
var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io').listen(server);
var gamejs = new require('../common/game.js');

app.use('/css',express.static(__dirname+'/css'));
app.use('/client',express.static(path.resolve(__dirname,'../client')));
app.use('/common',express.static(path.resolve(__dirname,'../common')));
app.use('/assets',express.static(__dirname+'/assets'));

app.get('/',function(req,res){
    res.sendFile('index.html', { root: './client'});
});

var seconds_per_tick = 10;
var second = Math.floor(Date.now() / 1000);
var tick = Math.floor( second / seconds_per_tick );
var Game = gamejs.Game;
var game = new Game();

server.lastPlayerID = 0;

server.listen(8081,function(){
    console.log('Listening on '+ server.address().port );
});

io.on('connection', function(socket) {
    socket.on('newguy', function() {
        socket.player = {
            id: server.lastPlayerID++,
            x: randomInt(100, 400),
            y: randomInt(100, 400),
        };
        socket.emit('allplayers', getAllPlayers());
        socket.emit('init_map', {
            tick: game.tick,
            planets: game.planets
        });
        socket.broadcast.emit('newguy', socket.player);
        console.log("stuff");

        socket.on('click', function(data) {
            console.log('click to ' + data.x + ', ' + data.y);
            socket.player.x = data.x;
            socket.player.y = data.y;
            io.emit('move', socket.player);
        });

        socket.on('disconnect', function() {
            io.emit('remove', socket.player.id);
        });
    });
});

function getAllPlayers(){
    var players = [];
    Object.keys(io.sockets.connected).forEach(function(socketID){
            var player = io.sockets.connected[socketID].player;
            if(player) players.push(player);
        });
    return players;
};

function randomInt(low,high){
    return Math.floor(Math.random()*(high-low)+low);
};

setInterval(function() {
    second = Math.floor(Date.now() / 1000);
    tick = Math.floor( second / seconds_per_tick );
    console.log(tick);
    io.sockets.emit('tick', {
        tick: tick
    });
}, 1000 * seconds_per_tick);