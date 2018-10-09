console.log('hello');

Game = {};

Game.create = function(){
    Client.askNewPlayer();
};

Game.geometry = {};

Game.init_map = function(data){
    console.log("init_map");

    var canvas = document.getElementById('map1');
    canvas_side = 640;
    Game.width = canvas.width = canvas_side;
    Game.height = canvas.height = canvas_side;
    Game.planets = data.planets;
    Game.tick = data.tick;
    Game.num_positions = 576;
    twopi = 2 * 3.1415;
    Game.cx = canvas.width / 2;
    Game.cy = canvas.height / 2;
    Game.tick_angle = twopi / Game.num_positions;
    Game.radius_factor = (canvas.width / 2) * 16;
    Game.jump_distance = canvas_side / 8;
    Game.update_planets(data.tick);
    Game.draw();
};

Game.draw = function() {
    console.log('draw');
    var canvas = document.getElementById('map1');
    if (canvas.getContext) {
        var context = canvas.getContext("2d");

        // background
        context.fillStyle = "#0F0F1F";
        context.fillRect(0, 0, canvas.width, canvas.height);

        // jumps
        var pairs = pairwise(Game.planets);
        for (var i = 0; i < pairs.length; i++) {
            p1 = pairs[i][0];
            p2 = pairs[i][1];
            d = distance(p1, p2);

            if (d < Game.jump_distance) {
                context.beginPath();
                context.moveTo(p1.canvas_x, p1.canvas_y);
                context.lineTo(p2.canvas_x, p2.canvas_y);
                context.strokeStyle = "#00FF00";
                context.stroke();
            }
        }

        // planets
        // console.log(Game.planets);
        for (var i = 0; i < Game.planets.length; i++) {
            p = Game.planets[i];

            // planet circle
            context.fillStyle = p.color;
            context.beginPath();
            context.arc(p.canvas_x, p.canvas_y, p.radius * 9, 0, Math.PI * 2, true);
            context.fill();

            // label
            context.fillStyle = "gray";
            context.font = "14px Verdana";
            context.fillText(p.name, p.canvas_x, p.canvas_y);
        }

        // tick
        context.fillStyle = "gray";
        context.font = "14px Verdana";
        context.fillText(Game.tick, 10, 20);
    }
};

Game.update_planets = function update_planets(tick_t) {
    Game.tick = tick_t;
    for (var i = 0; i < Game.planets.length; i++) {
        p = Game.planets[i];
        p.position = position_of_planet(p, tick_t);

        t = Date.now() / 1000;
        A = p.position * Game.tick_angle;
        c = Math.cos(A);
        s = Math.sin(A);
        R0 = p.semimajor_axis * Game.radius_factor;
        x = R0 * c + Game.cx; // new x coordinates
        y = R0 * s + Game.cy; // new y coordinates
        p.x = x;
        p.y = y;
        // scaling :(
        p.canvas_x = p.x * 1;
        p.canvas_y = p.y * 1;
        if (p.x > Game.width || p.y > Game.height || p.x < 0 || p.y < 0) {
            console.log(p);
        }
        p.color = "blue";
    }
};

function position_of_planet(p, tick_t) {
    return (p.speed * tick_t) % Game.num_positions;
}

// https://codereview.stackexchange.com/questions/75658/pairwise-combinations-of-an-array-in-javascript
function pairwise(list) {
    if (list.length < 2) {
        return [];
    }
    var first = list[0],
        rest = list.slice(1),
        pairs = rest.map(function(x) {
            return [first, x];
        });
    return pairs.concat(pairwise(rest));
}

function distance(p1, p2) {
    var dx = p1.canvas_x - p2.canvas_x;
    var dy = p1.canvas_y - p2.canvas_y;
    var dist = Math.sqrt(dx * dx + dy * dy);
    return dist;
}
