const express = require('express');
const socket = require('socket.io');
const Worker = require('./worker');

const worker = new Worker();
const app = express();

const server = app.listen(3000, () => {console.log(`Server running on localhost:3000!`)});

const io = socket(server);

app.use('/', express.static(__dirname+'/public'));
app.get('/index', (req, res) => {
    res.sendFile(__dirname+'/public/index.html');
})

io.on('connection', socket => {
    socket.join(['buy','sell']);
    
    let interval = -1;

    socket.on('send', request => {
        worker.setTimer(request.period * 1000);
        console.log(request.currency);
        let data = worker.getData()[request.currency];
        console.log(data);
        clearInterval(interval);    
        interval = setInterval(() => {
            socket.emit('btc', data);
        });
    });

    socket.on('message', message => {       
        const {text, room} = message;

        if(room == 'buy' || room == 'sell'){
            console.log(`${room}: ${text}`);
            socket.nsp.to(room).emit('message', {
                room, text
            });
        }
    })
});