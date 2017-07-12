const IPFS = require('ipfs')
const Room = require('ipfs-pubsub-room')

const ipfs = new IPFS({
    repo: repo(),
    EXPERIMENTAL: {
        pubsub: true
    }
})

ipfs.once('ready', () => ipfs.id((err, info) => {
    if (err) { throw err }
    console.log('IPFS now ready with address ' + info.id)
}))

const room = Room(ipfs, 'ipfs-pubsub-demo')

room.on('peer joined', (peer) => console.log('peer'+ peer + ' joined'))
room.on('peer left', (peer) => console.log('peer'+ peer + ' left'))

// send and receive messages

room.on('peer joined', (peer) => room.sendTo(peer, 'Hello ' + peer + '!'))
room.on('message', (message) => console.log('got message from ' + message.from + ': ' + message.data.toString()))

// broadcast every 2 seconds

setInterval(() => room.broadcast('hey everyone!'), 2000)

function repo () {
    return 'ipfs/pubsub-demo/' + Math.random()
}