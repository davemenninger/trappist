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
        game.removePlayer(id);
    });

    Client.sendClick = function(x, y) {
        Client.socket.emit('click', {
            x: x,
            y: y
        });
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
                            console.log('hit ' + p.name);
                        }
                    }
                },
                false);
        }
    };
});
