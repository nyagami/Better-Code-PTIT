function loadScript(text, callback)
{
    // adding the script element to the head as suggested before
   var body = document.getElementsByTagName('body')[0];
   var script = document.createElement('script');
   script.type = 'text/javascript';
   script.text = text;

   // then bind the event to the callback function 
   // there are several events for cross browser compatibility
   script.onreadystatechange = callback;
   script.onload = callback;

   // fire the loading
   body.appendChild(script);
}

function removeScipt(){
    
}


script = `

const Iam = $("p.nav__profile__menu__code").text();

class User{
    constructor(user){
        this.full_name = user.full_name;
        this.username = user.username;
        this.avatar = localStorage.getItem('this.username' + 'avatar') || "";
        if(this.username == null){
            this.profile = "";
        }else{
            this.profile = "/user/" + this.username;
        }
    }

    static getAvatar(username, index){
        if(username == null) return;
        else{
            if(this.avatar) document.getElementById(\`id-avatar-\${username}-\${index}\`).setAttribute("src", this.avatar);
            else{
                const requestHeaders = { "accept": "application/json;odata=verbose" };
                $.ajax({
                    url: "/user/" + username,
                    contentType: "application/json;odata=verbose",
                    headers: requestHeaders,
                    success: onSuccess,
                    error: onError
                }); 
                function onSuccess(data, request) {
                    const parser = new DOMParser();
                    let html = parser.parseFromString(data, 'text/html');
                    let avatar = html.querySelector(".profile__avt img").src;
                    document.getElementById(\`id-avatar-\${username}-\${index}\`).setAttribute("src", avatar);
                    localStorage.setItem(this.username + 'avatar', avatar);
                }
                
            } 
            function onError(error) {
            }
        }
    }
}

class Message{
    constructor(msg){
        this.content = msg.message.replaceAll("&gt;", ">").replaceAll("&lt;br", "<br").replaceAll("&lt;span","<span").replaceAll("&lt;/span","</span").replaceAll("&quot;",'"');
        this.default_avatar = "https://code.ptit.edu.vn/2020/images/avt.png";
        this.dest_user = new User(msg.dest_user);
        this.time = msg.time;
        this.user = new User(msg.user);
        if(this.dest_user.username){
            this.private = true;
            this.public = false;
        }else{
            this.private = false;
            this.public = true;
        }
    }

    toHTML(index){
        let header = \`<div class="message-header">
                        <a href="\${this.user.profile}" class="username">\${this.user.username == Iam ? "Tôi" : this.user.full_name}</a>
                        gửi tới
                        <a href="\${this.dest_user.profile}" class="username \${this.dest_user.username == null ? "disable-link" : ""}">\${this.dest_user.full_name}</a>
                        \${this.private ? \`<span class="tag"> gửi riêng <span>\` : ""}
                    </div>\`;
        let avatar = localStorage.getItem(this.user.username + 'avatar');
        let content = \`<div class="message-block d-flex \${this.user.username == Iam ? "flex-row-reverse" : ""}">
                        <div>
                            <img onload="\${avatar ? function(){} : User.getAvatar(this.user.username, index)}" id="id-avatar-\${this.user.username}-\${index}" src="\${avatar ? avatar : this.default_avatar}" class="rounded-circle avatar">
                        </div>
                        <div class="message-content \${this.user.username == Iam ? "iam" : ""} \${this.private ? "private-message" : "" }">
                            <p>\${this.content}</p>
                        </div>
                        </div>\`;
        let footer = \`<div class="message-footer"></div>\`

        if(this.user.username == Iam){
            footer = \`<div class="message-footer">
                            <span class="message-time">\${this.time}</span>
                        </div>\`
        }else{
            footer = \`<div class="message-footer">
                            <span class="message-reply" role="button" onclick="set_mention_user('\${this.user.username}', '\${this.user.full_name}')">Trả lời</span>
                            <span class="message-reply" role="button" onclick="set_dest_user('\${this.user.username}', '\${this.user.full_name}')">Nhắn riêng</span>
                            <span class="message-time">\${this.time}</span>
                        </div>\`;
        }
        
        return \`<div class="message-container">\`+ header + content + footer + \`</div>\`;
    }
}

function make_message_header(action_content, who){
    $('.chat__panel__input__head').empty();
    let header = \`<div class="message-input-header">
                        \${action_content} <span class="username">\${who}</span>
                        <span><i class="fa fa-times" role="button" onclick="$('.chat__panel__input__head').empty()"></i></span>
                    </div>\`;
    $('.chat__panel__input__head').prepend(header);
}

function set_dest_user(username, full_name){
    localStorage.setItem('dest_user', username);
    localStorage.setItem('mention_user', '');
    make_message_header('Bạn đang <b>nhắn riêng</b> cho', full_name);
}

function set_mention_user(username, full_name){
    localStorage.setItem('mention_user', username ? full_name : '');
    localStorage.setItem('dest_user', '');
    make_message_header('Bạn đang <b>trả lời</b> tin nhắn của', full_name);
}

function set_default_user(){
    $('.chat__panel__input__head').empty();
    localStorage.setItem('mention_user', '');
    localStorage.setItem('dest_user', '');
}

function update_message(data) {
    $('#chat__body').empty();
    for(let i = 0; i < data.messages.length; i++){
        data.messages[i] = new Message(data.messages[i]);
        $('#chat__body').append(data.messages[i].toHTML(i));
    }
    $("#chat__body").scrollTop(function() { return this.scrollHeight;});
}

function send_message(){
    let content = $('#msg').val();
    if(content.length == 0) return;
    content = content.replaceAll('\\n', '<br>');
    let dest_username = localStorage.getItem('dest_user');
    let mention_user = localStorage.getItem('mention_user');
    if(mention_user != null && mention_user){
        content = \`<span class="username">@\${mention_user}</span> \` + content;
    }
    $.ajax({
        type: "POST",
        url: '/chat',
        dataType: "json",
        data: { 'message': content, 'username': dest_username, 'channel': chat_channel},
        success: function (data) {
        }
    });
    $("#msg").val('');
}

set_default_user();
$('#msg').unbind();
form = $('#msg').parent();
let send_button = \`<span class="send-button" onclick="send_message()">
                        <i class="fa fa-paper-plane" aria-hidden="true"></i>
                    </span>\`;
form.append(send_button);
$('.chat__panel__input__head').empty();

socket.off('chat message');
socket.on('chat message', function (msg) {
    new_msg = new Message(msg);
    $('#chat__body').append(new_msg.toHTML());
    $("#chat__body").scrollTop(function () { return this.scrollHeight; });
    if (!chat_open) {
        new_message++;
        $('#chat__icon__noti__number').html(new_message);
        $('#chat__icon__noti').show();
    }
});
`
loadScript(script);
