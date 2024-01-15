const express = require("express");
const path = require("path");
const PORT = process.env.PORT || 5500;

const app = express();
const server = require("http").createServer(app);

const io = require("socket.io")(server, {
    path: "/socket",
});

app.use(express.static(path.join(__dirname + "public")));
app.use('/files', express.static(path.join(__dirname, "ChatBox" )));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  });

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


server.listen(PORT, () => {
    console.log(`Server is running on https://them-boyz-chatroom-server.onrender.com or port ${PORT}`);
});