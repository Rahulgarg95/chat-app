document.addEventListener('DOMContentLoader', () => {

    //Connecting to wb sockets
    var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

    socket.on('connect', () => {

        //Notifying the server that user has joined
        socket.emit('joined');

        document.querySelector('#newChannel').addEventListener('click', () => {
            localStorage.removeItem('last_channel');
        });

        document.querySelector('#leave').addEventListener('click', () => {
            socket.emit('leave');

            localStorage.removeItem('last_channel');
            window.location.replace('/');
        });

        document.querySelector('#logout').addEventListener('click', () => {
            localStorage.removeItem('last_channel');
        });
    });
});