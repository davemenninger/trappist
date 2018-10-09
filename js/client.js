var Client = {};
Client.socket = io.connect();

Client.askNewPlayer = function(){
    Client.socket.emit('newguy');
    console.log("hello?");
};

Client.socket.on('init_map',function(data){
    console.log("thanks");
    // console.log(data);
    Game.init_map(data);
});

Client.socket.on('allplayers',function(data){
    // console.log(data);
});

Client.socket.on('tick',function(data){
    // console.log(data);
    Game.update_planets(data.tick);
    Game.draw();
});

Client.socket.on('remove',function(id){
    Game.removePlayer(id);
});

Client.sendClick = function(x,y){
    Client.socket.emit('click',{x:x,y:y});
};

Client.socket.on('move',function(data){
    Game.movePlayer(data.id,data.x,data.y);
});
