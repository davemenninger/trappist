document.addEventListener('DOMContentLoaded', function() {
    console.log('start client');

    var game = new Game();

    var Client = {};
    Client.socket = io.connect();

    Client.askNewPlayer = function() {
        Client.socket.emit('newguy');
        console.log("hello?");
    };

    Client.socket.on('init_map', function(data) {
        console.log("thanks");
        game.init_map(data);
    });

    Client.socket.on('allplayers', function(data) {
        // console.log(data);
    });

    Client.socket.on('tick', function(data) {
        console.log('tick');
        console.log(data);
        game.update_planets(data.tick);
        game.draw();
    });

    Client.socket.on('remove', function(id) {
        Game.removePlayer(id);
    });

    Client.sendClick = function(x, y) {
        Client.socket.emit('click', {
            x: x,
            y: y
        });
    };

    // go
    Client.askNewPlayer();
});
