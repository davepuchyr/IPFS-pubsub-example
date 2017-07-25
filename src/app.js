const IPFS = require('ipfs')
const Room = require('ipfs-pubsub-room')
const Buffer = require('safe-buffer').Buffer

const ipfs = new IPFS({
    repo: repo(),
    config: {
        Addresses: {
            Swarm: [
                '/libp2p-webrtc-star/dns4/star-signal.cloud.ipfs.team/wss'
            ]
        },
        Discovery: {
            webRTCStar: {
                Enabled: true
            }
        }
    },
    EXPERIMENTAL: {
        pubsub: true
    }
})

var nodeAdress

ipfs.once('ready', () => ipfs.id((err, info) => {
    if (err) { throw err }
    nodeAdress = info.id
    newMessage('<b>IPFS now ready with address </b>')
    document.getElementById('header').innerHTML += '<img src=https://robohash.org/' + nodeAdress + '.png height=100%>'

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
    /*
        room.on('peer joined', (peer) => {
        room.sendTo(peer, 'Hello ' + peer + '!'),
            newMessage('Hello ' + peer + '!')
    }) */
room.on('message', (message) => {
    // console.log({ message_from: message.from }, { msg: message.data.toString() })
    newMessage(message.data.toString())
})

// broadcast every 2 seconds
// setInterval(() => room.broadcast('Ralph: Im a message!'), 10000)

function repo() { // new repo initialized for each window
    return 'ipfs/pubsub-demo/' + Math.random()
}

function processForm(e) {
    if (e.preventDefault) e.preventDefault();

    var newMsg = document.getElementById("postTxt").value
    room.broadcast(newMsg)
    store(newMsg)

    return false // You must return false to prevent the default form behavior
}

var form = document.getElementById('postForm');
if (form.attachEvent) {
    form.attachEvent("submit", processForm);
} else {
    form.addEventListener("submit", processForm);
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

function newMessage(msg) {
    document.getElementById('message').innerHTML += '<br>' + msg + ': '
}