const path = require('path')

const http = require('http')

const express = require('express')
const socketio = require('socket.io')
const Filter  = require('bad-words')
const {generateMessage} = require('./utils/messages')

const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users')
const { addMsg, removeMsg } = require('./utils/memory')
const app  =  express()

const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT  || 3000
const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))
let count = 0
io.on('connection', (socket) =>{
    console.log('New web socket connection')

    socket.on('join', ({username, room}, callback)=>{

        const {error, user} = addUser({ id: socket.id, username, room})

        if(error){
            return callback(error)

        }
        socket.join(user.room)

        socket.emit('message', generateMessage('Chat Bot', `Welcome ${user.username} !!!`, ++count))

        socket.broadcast.to(user.room).emit('message', generateMessage('Chat Bot', `${user.username} has joined!!!`, ++count))
        io.to(user.room).emit('roomdata', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })

        callback()


    })
    
    socket.on('sendRemoveId', id => {
        const user = getUser(socket.id)
        const reply = removeMsg(id)

        io.to(user.room).emit('removeMsg', id)
        socket.emit('message', generateMessage('Server Bot', reply.server_reply, ++count))
    })

    socket.on('sendMessage', (msg, type, callback)=>{
        const user = getUser(socket.id)
        const filter = new Filter()

        if(filter.isProfane(msg))
        {
            return callback('bad-words not allowed')
        }
        ++count
        const reply = addMsg({text: msg, type, count})
        if(reply.index == -1)
        {
            socket.emit('message', generateMessage('Server Bot', reply.server_reply, ++count))
            callback()
        }
        
      
        io.to(user.room).emit('message', generateMessage(user.username, msg, count, count))
        socket.emit('message', generateMessage('Server Bot', reply.server_reply, ++count))
        callback()
    })

    socket.on('disconnect', ()=>{
        const user = removeUser(socket.id)
        if(user){
            io.to(user.room).emit('message', generateMessage('Chat Bot', `${user.username} has left!!!`, ++count))
            io.to(user.room).emit('roomdata', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })

        }
        
    })
})

server.listen(port, ()=> {
    console.log(`listening on port ${port}`)
})

