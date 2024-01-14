const express = require("express");
const path = require("path");

const app = express();
const server = require("http").createServer(app);

const io = require("socket.io")(server);

app.use(express.static(path.join(__dirname+"/public")));
app.use('/files', express.static(path.join(__dirname, "C:\Users\Latitude\OneDrive\Desktop\Yo\practice" )));

io.on("connection", function(socket){
    socket.on("newuser", function(username){
        socket.broadcast.emit("update", " " + username + " joined the conversation");
    });
    socket.on("exituser", function(username){
        socket.broadcast.emit("update", " " + username + " left the conversation");
    });
    socket.on("chat", function(message){
        socket.broadcast.emit("chat", message);
    });
});


server.listen(5500, '0.0.0.0', () => {
    console.log('Server is running on http://0.0.0.0:5500/')
});