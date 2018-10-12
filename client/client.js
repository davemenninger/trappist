document.addEventListener('DOMContentLoaded', function() {
    console.log('start client');

    var game = new Game();
    var me;

    var Client = {};

    Client.socket = io.connect();

    Client.askNewPlayer = function() {
        Client.socket.emit('newguy');
        console.log("hello?");
    };

    Client.socket.on('init_map', function(data) {
        console.log("thanks");
        document.getElementById('connection_status').innerHTML = 'connected';
        console.log(data);
        me = data.you;
        game.init_map(data);
    });

    Client.socket.on('newguy', function(data) {
        console.log('newguy');
        game.add_player(data);
    });

    Client.socket.on('allplayers', function(data) {
        console.log('allplayers');
        console.log(data);
        game.players = data;
    });

    Client.socket.on('tick', function(data) {
        game.update_planets(data.tick);
        game.draw(me);
    });

    Client.socket.on('move', function(data) {
        console.log('move');
        if (data.player.id == me.id) {
            me = data.player;
        }
        game.move_player_to_planet(data.player, data.planet);
        game.draw(me);
    });

    Client.socket.on('remove', function(id) {
        console.log(id);
        game.remove_player(id);
    });

    Client.socket.on('disconnect', function(reason) {
        console.log('the server went away: ' + reason);
        document.getElementById('connection_status').innerHTML = 'lost connection <a href="javascript:window.location.href=window.location.href">reload</a>';
    });

    Client.sendClick = function(p) {
        Client.socket.emit('click', {planet: p});
    };

    // go
    Client.askNewPlayer();

    document.onreadystatechange = function() {
        if (document.readyState == "complete") {

            var canvas = document.getElementById('map1');
            canvas.addEventListener('click', function(event) {
                    console.log('click');
                    var rect = canvas.getBoundingClientRect();
                    var selected_pixel = {
                        x: (event.clientX - rect.left) / (rect.right - rect.left) * canvas.width,
                        y: (event.clientY - rect.top) / (rect.bottom - rect.top) * canvas.height
                    };

                    // for each planet, was this click within radius of the center of the planet
                    for (var i = 0; i < game.planets.length; i++) {
                        var p = game.planets[i];
                        // a squared plus b squared equals c squared
                        if (
                            Math.pow(selected_pixel.x - p.x, 2) // x distance to center
                            +
                            Math.pow(selected_pixel.y - p.y, 2) // y distance to center
                            <=
                            Math.pow(p.radius * 9, 2) // arbitrary 9 matches one in draw function
                        ) {
                            Client.sendClick(p);
                            console.log('hit ' + p.name);
                        }
                    }
                },
                false);
        }
    };
});
