require("dotenv").config();
const path=require('path');
const express = require("express");
const exphbs = require("express-handlebars");
const app = express();
const cookieparser=require("cookie-parser")
const port = process.env.GAME_PORT;
const bodyparser = require("body-parser");
const http = require('http');
const methodOverride=require("method-override");
const db=require('./db/config');
const User=require('./models/user');
const Board=require('./models/board')

const route=require("./routers");

app.use('/public/image',express.static(__dirname+'/public/image'));
app.use('/public/js',express.static(__dirname+'/public/js'));
app.use('/public/css',express.static(__dirname+'/public/css'));
app.use(express.static(path.join(__dirname,'public')));
app.use(express.urlencoded({
    extended: true
}));
app.use(express.json());
app.use(methodOverride('_method'));

app.engine(
    'hbs',
    exphbs.engine({
        extname: '.hbs',
        helpers:{
          sum: (a,b)=>a+b,
          section:function(name, options){
              if(!this._sections){this._sections = {}};
              this._sections[name] = options.fn(this);
              return null;
          }
      }
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
var availableTable=[];
const socketIo = require('socket.io');
const io = socketIo(server);

const clients = {};
var players = {}; // opponent: scoket.id of the opponent, symbol = "X" | "O", socket: player's socket

var username;
var table;
var unmatched=[];



// When a client connects
io.on("connection", function(socket) {
    let id = socket.id;
    
    username = socket.handshake.query.un;
    table = socket.handshake.query.tableId;
    const page = socket.handshake.query.page;


    onlineUsers[socket.id] = { id: socket.id, name: username};
    io.emit('updateOnlineUsers', Object.values(onlineUsers));

    availableTable=getAvailableTable();
    io.emit('updateAvailableTables',availableTable);

    if (page){
      if (page=='board'){
         console.log("New client connected. ID: ", socket.id);
         clients[socket.id] = socket;
        

        socket.on("disconnect", () => { 
           console.log("Client disconnected. ID: ", socket.id);
           //Board.changeStatus(parseInt(table),"end");
           delete clients[socket.id];
           socket.broadcast.emit("clientdisconnect", id);
        });

        console.log(unmatched);

        join(socket); // Fill 'players' data structure
        availableTable=getAvailableTable();
        io.emit('updateAvailableTables',availableTable);
        
        console.log(players[socket.id].opponent);
        console.log(unmatched);
        
        if (opponentOf(socket)) { // If the current player has an opponent the game can begin
          console.log("Game start");  
          Board.changeStatus(parseInt(table),"start");

          availableTable=getAvailableTable();
          io.emit('updateAvailableTables',availableTable);

          socket.emit("game.begin", { // Send the game.begin event to the player
             symbol: players[socket.id].symbol
          });
          opponentOf(socket).emit("game.begin", { // Send the game.begin event to the opponent
            symbol: players[opponentOf(socket).id].symbol 
           });
        }

        socket.on("winner",function(data){
          if (data==players[socket.id].symbol){
             console.log(players[socket.id].name);
             Board.updateWinner(parseInt(table),players[socket.id].name);
             User.getScore(players[socket.id].name);
          }
          Board.changeStatus(parseInt(table),"end");
        })
        
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
                Board.changeStatus(parseInt(table),"end");
                opponentOf(socket).emit("opponent.left");
              }
        });
      } 
      else if (page=="board1"){

        console.log("New client connected. ID: ", socket.id);
         clients[socket.id] = socket;
        

        socket.on("disconnect", () => { 
           console.log("Client disconnected. ID: ", socket.id);
           //Board.changeStatus(parseInt(table),"end");
           delete clients[socket.id];
           socket.broadcast.emit("clientdisconnect", id);
        });

        console.log(unmatched);

        join(socket); // Fill 'players' data structure

        availableTable=getAvailableTable();
        io.emit('updateAvailableTables',availableTable);
        
        console.log(players[socket.id].opponent);
        console.log(unmatched);
        
        if (opponentOf(socket)) { // If the current player has an opponent the game can begin
          console.log("Game start"); 

          Board.changeStatus(parseInt(table),"start");
          availableTable=getAvailableTable();
          io.emit('updateAvailableTables',availableTable);
          
          
          socket.emit("game.begin", { // Send the game.begin event to the player
             symbol: players[socket.id].symbol
          });
          opponentOf(socket).emit("game.begin", { // Send the game.begin event to the opponent
            symbol: players[opponentOf(socket).id].symbol 
           });
        }

        socket.on("winner",function(data){
          if (data==players[socket.id].symbol){
             console.log(players[socket.id].name);
             Board.updateWinner(parseInt(table),players[socket.id].name);
             User.getScore(players[socket.id].name);
          }
          Board.changeStatus(parseInt(table),"end");
        })
        
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
                const currentTable=Board.getByUn(parseInt( players[socket.id].table));
                
                Board.changeStatus(parseInt(table),"end");
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

function getAvailableTable(){
  const tables=db.getAll().Boards;
  const rs=[];
  for (var table of tables){
    if (table.player==null && table.status=="waiting"){
      rs.push(table);
    }
  }
  return rs;
  
}

function join(socket) {
    players[socket.id] = {
        opponent: null,
        symbol: "X",
        socket: socket,
        name: username,
        table:table
    };
    
    const currentTable=Board.getByUn(parseInt( players[socket.id].table));
    console.log(table);
    

    if (unmatched.length!=0 && currentTable.status=="waiting") { 
      
      for (var unmatch of unmatched){
        if (players[unmatch].name!=username && players[unmatch].table==table){
          console.log("dddodld");
          players[socket.id].symbol = "O";
          players[unmatch].opponent = socket.id;
          players[socket.id].opponent=unmatch;

          var index = unmatched.indexOf(unmatch);
          if (index !== -1) {
            unmatched.splice(index, 1);
          }
          return;  
        } 
      }
    } else if (currentTable.status!="end" || currentTable.status!="start" ){  
        unmatched.push(socket.id);
        if (currentTable.status=="create"){
          Board.changeStatus(parseInt(table),"waiting");
        }
    }
}

function opponentOf(socket) {
    
    if (!players[socket.id].opponent) {
        return;
        
    }

    return players[players[socket.id].opponent].socket;
}

server.listen(port, () => console.log(`Shop server listening on port ${port}`));
  