const socket = io()

//elements
const _messageForm = document.querySelector('#message-form')
const _messageFormInput = document.querySelector('input')
const _messageFormButton = document.querySelector('#sendButton')
const _messages = document.querySelector('#messages')

//templates
const messageTemplate = document.querySelector('#msg-template').innerHTML
const locationTemplate =  document.querySelector('#loc-msg-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

//options
const { username, room} = Qs.parse(location.search, { ignoreQueryPrefix: true})

const autoscroll = () =>{
    const _newMessage = _messages.lastElementChild

    const newMessageStyles = getComputedStyle(_newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)

    const newMessageHeight = _newMessage.offsetHeight + newMessageMargin

    const visibleHeight = _messages.offsetHeight


    const containerHeight = _messages.scrollHeight


    const scrolloffset = _messages.scrollTop + visibleHeight

    if(containerHeight - newMessageHeight <= scrolloffset){

        _messages.scrollTop = _messages.scrollHeight

    }





}

function remove(e) {

    const id = e.parentElement.parentElement.id
    console.log(e.parentElement.parentElement.id)
    socket.emit('sendRemoveId', id, () =>{
            console.log('remove request sent')
    } )

}
socket.on('message', (msg)=>{

    const html = Mustache.render(msg.username==username?locationTemplate:messageTemplate,{
        username: msg.username,
        message: msg.text,
        createdAt: moment(msg.createdAt).format('hh:mm A'),
        div_id: msg.id
    })
   
 
    _messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('roomdata', ({room, users}) =>{
    // console.log(room)
    // console.log(users)

    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})

socket.on('removeMsg', id =>{
    document.getElementById(id).remove()
})

_messageForm.addEventListener('submit', (e)=>{

    e.preventDefault()

    _messageFormButton.setAttribute('disabled', 'disabled')

    let data = document.querySelector('input').value 
    let type = document.getElementById('type').value
    socket.emit('sendMessage', data, type, (msg)=>{
    _messageFormButton.removeAttribute('disabled')
    _messageFormInput.value = ''
    _messageFormInput.focus()

        if(msg){
            return console.log(msg)
        }
        console.log('the message has been acknowledged')
    })

})


socket.emit('join', {username, room}, (error) =>{
    if(error){
        alert(error)
        location.href = '/'
    }
})