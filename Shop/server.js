require("dotenv").config();
const path=require('path');
const express = require("express");
const exphbs = require("express-handlebars");
const app = express();
const cookieparser=require("cookie-parser")
const port = process.env.GAME_PORT;
const bodyparser = require("body-parser");
const http = require('http');

const route=require("./routers");

app.use('/public/image',express.static(__dirname+'/public/image'));
app.use('/public/js',express.static(__dirname+'/public/js'));
app.use('/public/css',express.static(__dirname+'/public/css'));
app.use(express.static(path.join(__dirname,'public')));
app.use(express.urlencoded({
    extended: true
}));
app.use(express.json());
//app.use(methodOverride('_method'));

app.engine(
    'hbs',
    exphbs.engine({
        extname: '.hbs',
    })
);
app.set('view engine','hbs');
app.set('views',path.join(__dirname,'views'));

const session=require('express-session')
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
  }));


app.use(cookieparser());

route(app);


app.use((err, req, res, next) => {
    const statusCode = err.statusCode | 500;
    res.status(statusCode).send(err.message);
  });


  const server = http.createServer(app);
  
const onlineUsers = {};
const socketIo = require('socket.io');
const io = socketIo(server);

const clients = {};
var players = {}; // opponent: scoket.id of the opponent, symbol = "X" | "O", socket: player's socket
var unmatched;



// When a client connects
io.on("connection", function(socket) {
    let id = socket.id;
    const username = socket.handshake.query.un;
    const page = socket.handshake.query.page;

    onlineUsers[socket.id] = { id: socket.id, name: username};
    io.emit('updateOnlineUsers', Object.values(onlineUsers));

    if (page){
      if (page=='board'){
         console.log("New client connected. ID: ", socket.id);
         clients[socket.id] = socket;

         onlineUsers[socket.id] = { id: socket.id, name: username};
        

        socket.on("disconnect", () => { 
           console.log("Client disconnected. ID: ", socket.id);
           delete clients[socket.id];
           socket.broadcast.emit("clientdisconnect", id);
        });


        join(socket); // Fill 'players' data structure
        if (opponentOf(socket)) { // If the current player has an opponent the game can begin
          console.log("Game start");  
          socket.emit("game.begin", { // Send the game.begin event to the player
          symbol: players[socket.id].symbol
        });
        opponentOf(socket).emit("game.begin", { // Send the game.begin event to the opponent
            symbol: players[opponentOf(socket).id].symbol 
        });
    }
         // Event for when any player makes a move
        socket.on("make.move", function(data) {
        if (!opponentOf(socket)) {
            // This shouldn't be possible since if a player doens't have an opponent the game board is disabled
            return;
        }
        // Validation of the moves can be done here
        socket.emit("move.made", data); // Emit for the player who made the move
        opponentOf(socket).emit("move.made", data); // Emit for the opponent
        });
        socket.on("disconnect", function() {
          if (opponentOf(socket)) {
             console.log("Disconnect again");
             opponentOf(socket).emit("opponent.left");
           }
        });
      } 
    }
    
    socket.on('channel1',data=>{
      io.emit('channel1',data);
     })
    socket.on("disconnect", () => {
      delete onlineUsers[socket.id];
    // Gửi danh sách người dùng online sau khi có người mới ngắt kết nối
      io.emit('updateOnlineUsers', Object.values(onlineUsers));
    });
    
});

function join(socket) {
    players[socket.id] = {
        opponent: unmatched,
        symbol: "X",
        socket: socket
    };

    if (unmatched) { 
        players[socket.id].symbol = "O";
        players[unmatched].opponent = socket.id;
        unmatched = null;
    } else {  
        unmatched = socket.id;
    }
}

function opponentOf(socket) {
    if (!players[socket.id].opponent) {
        return;
    }
    return players[players[socket.id].opponent].socket;
}

server.listen(port, () => console.log(`Shop server listening on port ${port}`));
  