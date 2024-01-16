const express = require("express");
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const path = require("path");
const PORT = process.env.PORT || 5500;
const http = require("http");

const app = express();
const server = http.createServer(app);
const io = require("socket.io")(server, {
    path: "/socket",
});

const users = [];

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use('/files', express.static(path.join(__dirname, "Chat-Server" )));

function deleteUserData(username, mobile) {
    const indexToRemove = users.findIndex(user => user.username === username && user.mobile === mobile);
    if (indexToRemove !== -1) {
        users.splice(indexToRemove, 1);
    }
}

app.post('/submit', (req, res) => {
    const { username, mobile } = req.body;

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'morristoclo@gmail.com',
            pass: 'tocmorris208',
        },
    });

    const mailOptions = {
        from: 'morristoclo@gmail.com',
        to: 'morristoclo@gmail.com',
        subject: 'New Form Submission',
        text: `Name: ${username}\n Mobile: ${mobile}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.error(error);
        }

        console.log('Email sent:', info.response);

        users.push({ username, mobile });

        deleteUserData(username, mobile);

        res.send('Form submitted successfully');
    });
});
     
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