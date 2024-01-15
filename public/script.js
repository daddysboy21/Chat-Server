window.onload = function() {
(function(){
 
    const app = document.querySelector(".app");
    const socket = io('https://them-boyz-chatroom-server.onrender.com', {
        path: '/socket',
    });


    let uname;

    app.querySelector(".join-screen #join-user").addEventListener("click", function(){
        let username = app.querySelector(".join-screen #username").value;
        if(username.length == 0){
            return;
        }
        socket.emit("newuser",username);
        uname = username;
        app.querySelector(".join-screen").classList.remove("active");
        app.querySelector(".chat-screen").classList.add("active");
    });

    app.querySelector(".chat-screen #send-message").addEventListener("click", function(){
        let message = app.querySelector(".chat-screen #message-input").value;
        if(message.length == 0){
            return;
        }
        renderMessage("my", {
            username:uname,
            text:message
        });
        socket.emit("chat", {
            username:uname,
            text:message
        });
        app.querySelector(".chat-screen #message-input").value = "";
    });

    app.querySelector(".chat-screen #exit-chat").addEventListener("click",function(){
        socket.emit("exituser",uname);
        window.location.href = window.location.href;
    });

    socket.on("update",function(update){
        renderMessage("update",update);
    });

    socket.on("previousMessages", function (previousMessages) {
        console.log("Previous messages:", previousMessages);
        previousMessages.forEach((message) => renderMessage("other", message));
    });
    
    socket.on("chat",function(message){
        console.log("New message:", message);
        renderMessage("other",message);
    });
    socket.on("playMessageSound", function(){
        messageSound.play();
        console.log("Message sound played")
    });

    const messageSound = new Audio('https://them-boyz-chatroom-server.onrender.com/mixkit-elevator-tone-2863.wav');

    function renderMessage(type, message){
        let messageContainer = app.querySelector(".chat-screen .messages");
        if(type == "my"){
            let el = document.createElement("div");
            el.setAttribute("class", "message my-message");
            el.innerHTML = `
                <div>
                    <div class="name">You</div>
                    <div class="text">${message.text}</div>
                </div>
            `;
            messageContainer.appendChild(el);
        } else if(type == "other"){
            let el = document.createElement("div");
            el.setAttribute("class", "message other-message");
            el.innerHTML = `
                <div>
                    <div class="name">${message.username}</div>
                    <div class="text">${message.text}</div>
                </div>
            `;
            messageContainer.appendChild(el);
            messageSound.play();
        } else if(type == "update"){
            let el = document.createElement("div");
            el.setAttribute("class", "update");
            el.innerText = message;
            messageContainer.appendChild(el);
            messageSound.play();
        }
        messageContainer.scrollTop = messageContainer.scrollHeight - messageContainer.clientHeight;
    }

})();
};
