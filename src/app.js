const IPFS = require('ipfs')
const Room = require('ipfs-pubsub-room')
const Buffer = require('safe-buffer').Buffer

const ipfs = new IPFS({
    repo: repo(),
    EXPERIMENTAL: {
        pubsub: true
    }
})

ipfs.once('ready', () => ipfs.id((err, info) => {
    if (err) { throw err }
    newMessage('<b>IPFS now ready with address ' + info.id + '</b>')
}))

const room = Room(ipfs, 'ipfs-pubsub-demo')
room.on('peer joined', (peer) => {
    console.log('peer' + peer + ' joined'),
        newMessage('peer joined: ' + peer)
})
room.on('peer left', (peer) => {
        console.log('peer' + peer + ' left'),
            newMessage('peer left: ' + peer)
    })
    // send and receive messages
room.on('peer joined', (peer) => {
    room.sendTo(peer, 'Hello ' + peer + '!'),
        newMessage('Hello ' + peer + '!')
})
room.on('message', (message) => {
    console.log({ message_from: message.from }, { msg: message.data.toString() })
    newMessage(message.data.toString())
})

// broadcast every 2 seconds
// setInterval(() => room.broadcast('Ralph: Im a message!'), 10000)

// new repo initialized for each window
function repo() {
    return 'ipfs/pubsub-demo/' + Math.random()
}

function newMessage(msg) {
    document.getElementById('message').innerHTML += '<br>' + msg
}

document.getElementById("postButton").onclick = function() {
    var newMsg = document.getElementById("postTxt").value
    room.broadcast(newMsg)
}

// function to store image and text
function store(newMessage) {
    ipfs.files.add([new Buffer(newMessage)], (err, res) => {
        if (err) { throw err }

        const hash = res[0].hash
        console.log({ added_file_hash: hash })

        ipfs.files.cat(hash, (err, res) => {
            if (err) { throw err }
            let data = ''
            res.on('data', (d) => {
                data = data + d
            })
            res.on('end', () => {
                console.log({ added_file_contents: data })
            })
        })
    })
}