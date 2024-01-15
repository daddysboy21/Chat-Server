const express = require("express");
const path = require("path");
const PORT = process.env.PORT || 5500;
const http = require("http");

const app = express();
const server = http.createServer(app);
const io = require("socket.io")(server, {
    path: "/socket",
});

app.use(express.static(path.join(__dirname, "public")));
app.use('/files', express.static(path.join(__dirname, "Chat-Server" )));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  });

  const maxMessages = 500
  const messages = [];

  function trimMessages() {
    while (messages.length > maxMessages) {
        messages.shift();
    }
}
  function cleanUpMessages() {
    const now = new Date().getTime();
    const twentyFourHoursAgo = now - 24 * 60 * 60 * 1000;
    const updatedMessages = messages.filter(message => message.timestamp >= twentyFourHoursAgo);
    messages.length = 0;
    Array.prototype.push.apply(messages, updatedMessages);
  }
  setInterval(cleanUpMessages, 60 * 60 * 1000);

io.on("connection", function(socket){
    socket.on("connection", function (socket) {
        socket.emit("previousMessages", messages);
    });
    
    socket.on("newuser", function(username){
        socket.broadcast.emit("update", " " + username + " joined the conversation");
    });

    socket.on("exituser", function(username){
        socket.broadcast.emit("update", " " + username + " left the conversation");
    });

    socket.on("chat", function(message){
        message.timestamp = new Date().getTime();
        messages.push(message);
        trimMessages();
        console.log("Updated messages:", messages);
        socket.broadcast.emit("chat", message);
        socket.broadcast.emit("playMessageSound");
    });
});


server.listen(PORT, () => {
    console.log(`Server is running on https://them-boyz-chatroom-server.onrender.com or port ${PORT}`);
});