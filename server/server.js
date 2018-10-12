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

var seconds_per_tick = 2;
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
            planet: 'B',
        };
        game.add_player( socket.player );
        socket.emit('init_map', {
            tick: game.tick,
            planets: game.planets,
            players: getAllPlayers(),
            you: socket.player
        });
        socket.broadcast.emit('newguy', socket.player);

        socket.on('click', function(data) {
            console.log( socket.player.id );
            console.log('click to ' + data.planet.name);
            game.move_player_to_planet(
                socket.player,
                data.planet
            );
            io.emit('move', { player: socket.player, planet: data.planet });
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
    game.update_planets(tick);
    io.sockets.emit('tick', {
        tick: tick
    });
}, 1000 * seconds_per_tick);
