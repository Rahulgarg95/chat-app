document.addEventListener("DOMContentLoaded", () => {
    //Getting user details on webpage load
    get_user_details();
});

const init = username => {
    //Initialising the socket
    let socket = io.connect('http://' + document.domain + ':' + location.port);

    //Function calling connection
    socket.on("connect", () => {
        //To record username in list at Flask end
        socket.emit("userdet", { username });

        //Function taking channel input and msg input
        set_channel(socket);

        //Function initializing new channel and adding to dict in flask
        socket.on("new channel", data => {
            show_channel(data.name, socket);
        });

        socket.on("msg", data => {
            show_msg(data);
        });

        socket.on('channels', data => {
            let ul = document.querySelector("#channel-list");
            ul.innerHTML = "";
            for (let c of data) {
                show_channel(c, socket);
            }

            document.querySelectorAll("#channel-list > li").forEach(e => {
                if (e.innerHTML == localStorage.getItem('channel')) {
                e.classList.add("active");
                } else {
                e.classList.remove("active");
                }
            });

            document.querySelector('#channel-label').innerHTML='<span class="text-muted"># </span>' + localStorage.getItem('channel');
        });


        socket.on('msgs', data => {
            let ul = document.querySelector("#msg-list");
            ul.innerHTML = "";
            data.forEach(msg => {
                show_msg(msg);
            });
        });
    });
};


const set_channel = socket => {
    let channel_form = document.querySelector('#channel-form');
    let channel_val = document.querySelector('#channel-name');
    let msg_form = document.querySelector('#msg-form');
    let msg_val = document.querySelector('#msg-text');

    //Function for getting channel name
    channel_form.addEventListener('submit', e => {
        e.preventDefault();

        let channel_name = channel_val.value;

        if(!channel_name) {
            console.log("No channel name entered......Enter a value");
            return;
        }

        socket.emit('new channel', {channel_name});

        channel_val.value="";
    });

    //Function for getting msg
    msg_form.addEventListener('submit', e => {
        e.preventDefault();

        let msg = msg_val.value;
        //Getting channnel value from localStorage
        let channel = localStorage.getItem('channel');

        if(!msg){
            console.log("Please enter a msg");
            return;
        }

        if(!channel){
            console.log("Channel does not exists");
            return;
        }

        socket.emit("new msg", {msg, channel, username: localStorage.getItem("username")
        });

        msg_val.value="";
    });

    //Fetch channel names on loading new page
    socket.emit("get channels");

    //Fetching messages of active channel name
    if(localStorage.getItem("channel")) {
        socket.emit("channel_msg", {name: localStorage.getItem("channel") });
    }
};

const show_channel = (name, socket) => {
    let ul = document.querySelector('#channel-list');

    let li = document.createElement("li");

    li.classList.add('list-group-item');
    li.innerHTML = name;

    li.addEventListener('click', () => {
        localStorage.setItem("channel", name);

        socket.emit("extract msg", {name});

        document.querySelector('#channel-label').innerHTML='<span class="text-muted"># </span>' + name;

        document.querySelectorAll("#channel-list > li").forEach(e => {
            if (e.innerHTML == name) {
              e.classList.add("active");
            } else {
              e.classList.remove("active");
            }
        });
    });

    ul.appendChild(li);
};

const show_msg = data => {
    if (localStorage.getItem("channel") == data.channel) {
      let ul = document.querySelector("#msg-list");
      let li = document.createElement("li");
  
      li.classList.add("list-group-item");
  
      li.innerHTML = `<strong>${data.username}</strong>: ${
        data.msg
      } <small class="text-muted d-flex justify-content-end">${get_date_string(
        data.created_at
      )}</small>`;
      ul.appendChild(li);
  
      // scroll msg-list
      ul.scrollTop = ul.scrollHeight - ul.clientHeight;
    }
};

//Function to fetch username
const get_user_details = () => {
    let username = localStorage.getItem("username");
    
    //Check if username exists already 
    if(!username){
        //Launching model to input username
        $(".modal").modal({ show: true, backdrop: "static" });

        //Function to get username details on user form submittion
        document.querySelector('#username-form').addEventListener('submit', e => {
            e.preventDefault();

            username = document.querySelector('#username-text').value;
            console.log(username);

            //Validating user not entering empty username
            if(typeof(username) == "string"){
                username=username.trim();
                if(username == ''){
                    username=null;
                }
                else{
                    //Inserting username in localStorage
                    localStorage.setItem('username', username);
                    $(".modal").modal("hide");

                    //Function to initiate socket and connection
                    init(username);
                }
            }
        });
    }
    else{
        init(username);
    }
};

const get_date_string = time => {
    time = new Date(time * 1000);
  
    let m_string = `${time.toDateString().split(" ")[1]} ${time.getDate()}`;
  
    if (time.getFullYear() != new Date().getFullYear()) {
      m_string += `, ${time.getFullYear()}`;
    }
  
    return `${time.toLocaleString("en-US", {
      hour: "numeric",
      minute: "numeric",
      hour12: true
    })} | ${m_string}`;
};