const msgMemory = []
const constMemory = []
const algorithm = ['Best Fit', 'First Fit', 'Worst Fit']
const idMemory = []
let freeSpace = 0;
//allocating random bytes to each memory location
for(let i=0;i<1001;i++)
{
    msgMemory[i]=Math.floor(100*Math.random())+1
    constMemory[i]=msgMemory[i]
    freeSpace+=msgMemory[i]
}


const addMsg = ({text, type, count})=>{

    let bytes = text.length * 2
    if(bytes>freeSpace)
    {
        return { server_reply: "Message can't be sent. Insufficient Memory on server.",
    index: '-1'}
    }

    let index = -1
   
   
        if(type==1)
        {
            let mini=1001
            for(let i=0;i<1001;i++)
            {
        
                if(msgMemory[i]>=bytes && msgMemory[i]<mini)
                {
                    index = i
                    mini = msgMemory[i]
                }
            }
        }
            
        else if(type==2)
        {
            for(let i=0;i<1001;i++)
            {
                if(msgMemory[i]>=bytes)
                {
                    index = i
                    break;
                } 
            }

        }
        else
        {
            let maxi = 0
            for(let i=0;i<1001;i++)
            {
                if(msgMemory[i]>=bytes && msgMemory[i]>maxi)
                {
                    index = i;
                    maxi = msgMemory[i]
                }
            }

        }
        if(index == -1)
    {
        return { server_reply: "Message can't be sent. Externel Fragmentation on server.",
                 index: '-1'}
    }
    else
    {
        msgMemory[index]-=bytes
        freeSpace-=bytes
        idMemory[count] = {bytes: bytes, index: index}
        let fragmentation = msgMemory[index]/constMemory[index]*100
        return { server_reply: `Message sent using ${algorithm[type-1]}. Message memory = ${bytes} bytes allocated to block ${index} with space = ${msgMemory[index]+bytes} bytes on server. Current space left on Block = ${msgMemory[index]} bytes
        . Internal Fragmentation = ${fragmentation}%`,
    index: '1'}
    }
    }
   
const removeMsg = id => {
    const index = idMemory[id].index
    const bytes = idMemory[id].bytes
    msgMemory[index]+=bytes
    freeSpace+=bytes
    return { server_reply: `Message removed. Message memory = ${bytes} bytes freed from block ${index}. Current space left on Block = ${msgMemory[index]} bytes.`}
}

module.exports = {
    addMsg,
    removeMsg
}
