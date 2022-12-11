var express = require('express'); 
let app = express();

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended:true}));

//Middleware; css/img/js
app.use(express.static('public'));

//Prépa queries
//USING TTL : time to live :: si dépassé ciau le message pouf pouf disparu asta la vista
//pas d'auto-incrmeent sur cassandra
const querySelectID = "SELECT next_id FROM ids WHERE id_name = 'message_id';";
const queryInsertNextId = "UPDATE ids SET next_id = (?) WHERE id_name = 'message_id';";
const querySelect = "SELECT * FROM messages LIMIT 10 ;"; 
const queryInsert = 'INSERT INTO messages (id, sender, message) VALUES (?,?,?);'; 
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
    console.log('Reading db ...');
    socket.send({"user":"server","content":"Reading db ..."})
    connection.execute(querySelect, function(error,result){
        if(error!=undefined){
            console.log('Error:',error);
        }else{
            for (var i = 0; i < result.rows.length; i++) {
                sender = result.rows[i].sender;
                content = result.rows[i].message;
                socket.send({"user":sender,"content":content})
            }
        }
    });
    socket.on("disconnect", async function() {
        //Quand un client se déconecte on rajoute ses elements ds la db
        // => plusieurs element identique peuvent se trouver ds la db....
        console.log(socket.id + " disconnected");
        try {
            io.emit('message',{"user": tempMessages[socket.id].user,"content":"just disconnected ..."});
        } catch {
            console.log("restart");
        }
    });

    socket.on('message', async function(message) {
        let user = message.user;
        let content = message.content;
        console.log("Message : " + content);
        // tempMessages[socket.id]={"user":user,"content":content};
        if (content==""){
            console.log(user + " is now connected");
            io.emit('message',{"user":user,"content":"is now connected ..."})
        } 
        else{
            io.emit('message', {"user":user, "content":content});
            tempMessages[socket.id] = {"user":user,"content":content};
            console.log("Prob", user);
            await connection.execute(querySelectID, async function(error, result){
                if(error!=undefined){
                    console.log('Error:',error);
                }else{
                    let i = 1;
                    for (const sock_id of Object.keys(tempMessages)) {
                        // console.log("message for now",tempMessages[sock_id].user + tempMessages[sock_id].content);
                        await connection.execute(queryInsert, [result.rows[0].next_id, tempMessages[sock_id].user, tempMessages[sock_id].content], { prepare: true })
                        .then(await connection.execute(queryInsertNextId, [result.rows[0].next_id + i], {prepare: true}));
                        i+=1;
                    }
                }
            });
        }
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
                    io.emit('onload', {"user":message.sender,"content":message.message})
                }
            }
          });
    });
});

server.listen(process.env.PORT || 3000, () => { 
   console.log('J ecoute au port 3000 socket');
});