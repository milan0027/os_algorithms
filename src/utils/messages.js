
const generateMessage = (username, text, count) =>{
    
    return{
        username,
        text,
        createdAt: new Date().getTime(),
        id: count
    }
}

module.exports = {
    generateMessage
}