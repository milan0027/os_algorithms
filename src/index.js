const path = require('path')

const http = require('http')

const express = require('express')
const socketio = require('socket.io')
const Filter  = require('bad-words')
const {generateMessage} = require('./utils/messages')

const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users')
const { addMsg } = require('./utils/memory')
const app  =  express()

const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT  || 3000
const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))

io.on('connection', (socket) =>{
    console.log('New web socket connection')

    socket.on('join', ({username, room}, callback)=>{

        const {error, user} = addUser({ id: socket.id, username, room})

        if(error){
            return callback(error)

        }
        socket.join(user.room)

        socket.emit('message', generateMessage('Chat Bot', 'Welcome'))

        socket.broadcast.to(user.room).emit('message', generateMessage('Chat Bot', `${user.username} has joined!!!`))
        io.to(user.room).emit('roomdata', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })

        callback()


    })
    
    socket.on('sendMessage', (msg, type, callback)=>{
        const user = getUser(socket.id)
        const filter = new Filter()

        if(filter.isProfane(msg))
        {
            return callback('bad-words not allowed')
        }
        const reply = addMsg({text: msg, type})
        if(reply.index == -1)
        {

            socket.emit('message', generateMessage('Chat Bot', reply.server_reply))
            callback()

        }
        
      
        io.to(user.room).emit('message', generateMessage(user.username, msg))
        socket.emit('message', generateMessage('Server Bot', reply.server_reply))
        callback()
    })

    socket.on('disconnect', ()=>{
        const user = removeUser(socket.id)
        if(user){
            io.to(user.room).emit('message', generateMessage('Chat Bot', `${user.username} has left!!!`))
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

