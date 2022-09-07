const express = require('express');
const app = express();
const cors = require('cors');
const socket = require('socket.io');

const userRouters = require('./routers/user.js');
const authRouters = require('./routers/auth.js');
const messageRouters = require('./routers/message.js');
const connectMongo = require('./utils/connect-mongo.js');
const HttpError = require('./utils/http-error.js');

const PORT = process.env.PORT || 5000;

connectMongo()

app.use(cors({
    origin : 'http://localhost:3000'
}))
app.use(express.json({extended : false}));
app.use(express.urlencoded({extended : false}))

app.use("/api/auth", authRouters);
app.use('/api/users', userRouters)
app.use('/api/messages', messageRouters);

app.use(async (req, res, next) => {
    return next(new HttpError('Route not found', 404));
})

app.use((error, req, res, next) => {
    return res.json({ message : error.message || 'Internal server error', statusCode : error.statusCode || 500});
})

const server = app.listen(PORT, () => console.log(`server running on port ${5000}`));
const io = socket(server,{
    cors : {
        origin : "http://localhost:3000",
        credentials : true,
    }
});
global.onlineUsers = new Map();
io.on("connection", (socket) => {
    global.chatSocket = socket;
    console.log(`user ${socket.id} connected`);
    socket.on('add-user', (userId)  => {
        onlineUsers.set(userId, socket.id);
    })
    socket.on('send-message', (data) => { 
        const receiverSocket = onlineUsers.get(data.receiver);
        if(receiverSocket){
            socket.to(receiverSocket).emit('receive-message', data.msg);
        }
    })
})
