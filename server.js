var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io').listen(server);


app.use('/css',express.static(__dirname+'/css'));
app.use('/js',express.static(__dirname+'/js'));
app.use('/assets',express.static(__dirname+'/assets'));

app.get('/',function(req,res){
    res.sendFile(__dirname+'/index.html');
});

// https://en.wikipedia.org/wiki/TRAPPIST-1#Planetary_system
planets = [
  { name: "A", speed: 0, radius: 0.00000001 },
  { name: "B", speed: 24, semimajor_axis: 0.01154775, radius: 1.121 },
  { name: "C", speed: 15, semimajor_axis: 0.01581512, radius: 1.095 },
  { name: "D", speed: 9, semimajor_axis: 0.02228038, radius: 0.784 },
  { name: "E", speed: 6, semimajor_axis: 0.02928285, radius: 0.910 },
  { name: "F", speed: 4, semimajor_axis: 0.03853361, radius: 1.046 },
  { name: "G", speed: 3, semimajor_axis: 0.04687692, radius: 1.148 },
  { name: "H", speed: 2, semimajor_axis: 0.06193488, radius: 0.773 }
  // { name: "X", speed: 24, radius: 0.1 }
];

var tick = 1;
var seconds_per_tick = 10;
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
            tick: tick,
            planets: planets
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
