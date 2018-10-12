(function(exports) {

  console.log('hello');

  var Game = function() {
    // https://en.wikipedia.org/wiki/TRAPPIST-1#Planetary_system
    this.planets = [
      // { name: "A", speed: 0, radius: 0.00000001 },
      { name: "B", speed: 24, semimajor_axis: 0.01154775, radius: 1.121 },
      { name: "C", speed: 15, semimajor_axis: 0.01581512, radius: 1.095 },
      { name: "D", speed: 9, semimajor_axis: 0.02228038, radius: 0.784 },
      { name: "E", speed: 6, semimajor_axis: 0.02928285, radius: 0.910 },
      { name: "F", speed: 4, semimajor_axis: 0.03853361, radius: 1.046 },
      { name: "G", speed: 3, semimajor_axis: 0.04687692, radius: 1.148 },
      { name: "H", speed: 2, semimajor_axis: 0.06193488, radius: 0.773 }
    ];

    // geometry
    this.num_positions = 576;
    var twopi = 2 * 3.1415;
    this.tick_angle = twopi / this.num_positions;
    this.canvas_side = 800;
    this.radius_factor = (this.canvas_side / 2) * 16;
    this.cx = this.canvas_side / 2;
    this.cy = this.canvas_side / 2;
    this.jump_distance = this.canvas_side / 8;

    this.players = [];
  };

  Game.prototype.create = function(){
      Client.askNewPlayer();
  };

  Game.prototype.init_map = function(data){
      console.log("init_map");
      this.players = data.players;

      var canvas = document.getElementById('map1');
      this.width = canvas.width = this.canvas_side;
      this.height = canvas.height = this.canvas_side;
      this.tick = data.tick;
      this.update_planets(data.tick);
      this.draw(data.you);
  };

  Game.prototype.draw = function(player) {
      var canvas = document.getElementById('map1');
      if (canvas.getContext) {
          var context = canvas.getContext("2d");

          // background
          context.fillStyle = "#0F0F1F";
          context.fillRect(0, 0, canvas.width, canvas.height);

          // jumps
          var pairs = this.pairwise(this.planets);
          for (var i = 0; i < pairs.length; i++) {
              p1 = pairs[i][0];
              p2 = pairs[i][1];
              d = this.distance(p1, p2);

              if (d < this.jump_distance) {
                  context.beginPath();
                  context.moveTo(p1.canvas_x, p1.canvas_y);
                  context.lineTo(p2.canvas_x, p2.canvas_y);
                  context.strokeStyle = "#00FF00";
                  context.stroke();
              }
          }

          // planets
          for (var i = 0; i < this.planets.length; i++) {
              p = this.planets[i];

              // planet circle
              context.fillStyle = p.color;
              context.beginPath();
              context.arc(p.canvas_x, p.canvas_y, p.radius * 9, 0, Math.PI * 2, true);
              context.fill();

              // you
              if ( player.planet == p.name )
              {
                // planet ring
                context.strokeStyle = "red";
                context.beginPath();
                context.arc(p.canvas_x, p.canvas_y, p.radius * 9, 0, Math.PI * 2, true);
                context.stroke();
              }

              // label
              context.fillStyle = "gray";
              context.font = "14px Verdana";
              context.fillText(p.name, p.canvas_x, p.canvas_y);

              // players
              var player_count = this.players.filter(plyr => plyr.planet == p.name).length;
              context.fillStyle = "yellow";
              context.font = "12px Verdana";
              context.fillText( player_count, p.canvas_x, p.canvas_y+12);
          }

          // tick
          context.fillStyle = "gray";
          context.font = "14px Verdana";
          context.fillText(this.tick, 10, 20);
          context.fillText("you are at: " + player.planet, 10, 34 );
      }
  };

  Game.prototype.update_planets = function(tick_t) {
      this.tick = tick_t;
      for (var i = 0; i < this.planets.length; i++) {
          p = this.planets[i];
          p.position = this.position_of_planet(p, tick_t);

          t = Date.now() / 1000;
          A = p.position * this.tick_angle;
          c = Math.cos(A);
          s = Math.sin(A);
          R0 = p.semimajor_axis * this.radius_factor;
          x = R0 * c + this.cx; // new x coordinates
          y = R0 * s + this.cy; // new y coordinates
          p.x = x;
          p.y = y;
          // scaling :(
          p.canvas_x = p.x * 1;
          p.canvas_y = p.y * 1;
          if (p.x > this.width || p.y > this.height || p.x < 0 || p.y < 0) {
              console.log(p);
          }
          p.color = "blue";
      }
  };

  Game.prototype.add_player = function(player) {
      console.log(player);
      if (player) this.players.push(player);
  };

  Game.prototype.remove_player = function(id) {
      this.players = this.players.filter( player => player.id != id );
  };

  Game.prototype.move_player_to_planet = function(player, planet) {
      console.log("move");
      p1 = this.planets.filter(plnt => plnt.name == player.planet)[0]; // lame
      p2 = planet;
      var d = this.distance(p1, p2);
      if (d < this.jump_distance) {
          console.log("jumpable!");
          var i = this.players.findIndex(plyr => plyr.id == player.id);
          this.players[i].planet = p2.name;
      } else {
          console.log("too far!");
      }
  };

  Game.prototype.position_of_planet = function(p, tick_t) {
      return (p.speed * tick_t) % this.num_positions;
  }

  // https://codereview.stackexchange.com/questions/75658/pairwise-combinations-of-an-array-in-javascript
  Game.prototype.pairwise = function(list) {
      if (list.length < 2) {
          return [];
      }
      var first = list[0],
          rest = list.slice(1),
          pairs = rest.map(function(x) {
              return [first, x];
          });
      return pairs.concat(this.pairwise(rest));
  }

  Game.prototype.distance = function(p1, p2) {
      var dx = p1.canvas_x - p2.canvas_x;
      var dy = p1.canvas_y - p2.canvas_y;
      var dist = Math.sqrt(dx * dx + dy * dy);
      return dist;
  }

  exports.Game = Game;

})(typeof global === "undefined" ? window : exports);
