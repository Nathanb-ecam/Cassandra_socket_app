var express = require('express'); 
let app = express();

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended:true}));

//Middleware; css/img/js
app.use(express.static('public'));

//Prépa queries
//USING TTL : time to live :: si dépassé ciau le message pouf pouf disparu asta la vista
//pas d'auto-incrmeent sur cassandra
const querySelectID = "SELECT next_id FROM ids WHERE id_name = 'message_id'";
const queryInsertNextId = "UPDATE ids SET next_id = (?) WHERE id_name = 'message_id'";
const querySelect = 'SELECT message FROM messages'; 
const queryInsert = 'INSERT INTO messages (id, sender, message) VALUES (?,?,?) USING TTL 86400'; 
let tempMessages = {};
let connection = require('./db.js');

//Server
var server = require("http").Server(app);
var io = require("socket.io")(server); 

//Routes
let routes = require('./routes');
app.use('/', routes);

//Socket
io.on("connection", function(socket) {
    console.log("Client connected: " + socket.id);

    socket.on("disconnect", async function() {
        //Quand un client se déconecte on rajoute ses elements ds la db
        // => plusieurs element identique peuvent se trouver ds la db....
        console.log(socket.id + " disconnected");
        io.emit('message',{"user":tempMessages[socket.id].Username,"content":"just disconnected ..."});
        await connection.execute(querySelectID, async function(error, result){
            if(error!=undefined){
                console.log('Error:',error);
            }else{
                for (var i = 0; i < tempMessages.length; i++) {
                    await connection.execute(queryInsert, [result.rows[0].next_id, tempMessages[i][1], tempMessages[i][0]], { prepare: true });
                    console.log('wat');
                    connection.execute(queryInsertNextId, [result.rows[0].next_id + i], {prepare: true});
                    console.log('added');
                }
            }
        });
    });

    socket.on('message', function(message) {
        let user = message.user;
        let content = message.content;
        console.log("Message : " + user);
        tempMessages[socket.id]={"Username":user,"message":content};
        if (content==""){
            console.log(user + " is now connected");
            io.emit('message',{"user":user,"content":"is now connected ..."})
        } 
        else{
            io.emit('message', {"user":user,"content":content});
            console.log("Prob",user);
        }
        console.log("tempMessages",tempMessages[user]);

        // io.emit('message', message)
    });

    socket.on('onload', function(e) {
        console.log("new client lets show him the past");
        connection.execute(querySelect, function(error,result){
            if(error!=undefined){
                console.log('Error:',error);
            }else{
                console.log(result.rows);
                for (var i = 0; i < result.rows.length; i++) {
                    message = result.rows.messages[i].message;
                    io.emit('onload', message)
                }
            }
          });
    });

});

server.listen(process.env.PORT || 3000, () => { 
   console.log('J ecoute au port 3000 socket');
});