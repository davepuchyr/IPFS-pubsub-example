const IPFS = require('ipfs')
const Room = require('ipfs-pubsub-room')
const Buffer = require('safe-buffer').Buffer

const ipfs = new IPFS({
    init: true,
    start: true,
    repo: repo(),
    config: {
        bootstrap: [
            "/ip4/104.131.131.82/tcp/4001/ipfs/QmaCpDMGvV2BGHeYERUEnRQAwe3N8SzbUtfsmvsqQLuvuJ",
            "/ip4/104.236.151.122/tcp/4001/ipfs/QmSoLju6m7xTh3DuokvT3886QRYqxAzb1kShaanJgW36yx",
            "/ip4/104.236.176.52/tcp/4001/ipfs/QmSoLnSGccFuZQJzRadHn95W2CrSFmZuTdDWP8HXaHca9z",
            "/ip4/104.236.179.241/tcp/4001/ipfs/QmSoLPppuBtQSGwKDZT2M73ULpjvfd3aZ6ha4oFGL1KrGM",
            "/ip4/104.236.76.40/tcp/4001/ipfs/QmSoLV4Bbm51jM9C4gDYZQ9Cy3U6aXMJDAbzgu2fzaDs64",
            "/ip4/128.199.219.111/tcp/4001/ipfs/QmSoLSafTMBsPKadTEgaXctDQVcqN88CNLHXMkTNwMKPnu",
            "/ip4/162.243.248.213/tcp/4001/ipfs/QmSoLueR4xBeUbY9WZ9xGUUxunbKWcrNFTDAadQJmocnWm",
            "/ip4/178.62.158.247/tcp/4001/ipfs/QmSoLer265NRgSp2LA3dPaeykiS1J6DifTC88f5uVQKNAd",
            "/ip4/178.62.61.185/tcp/4001/ipfs/QmSoLMeWqB7YGVLJN3pNLQpmmEk35v6wYtsMGLzSr5QBU3",
            "/ip6/2400:6180:0:d0::151:6001/tcp/4001/ipfs/QmSoLSafTMBsPKadTEgaXctDQVcqN88CNLHXMkTNwMKPnu",
            "/ip6/2604:a880:0:1010::23:d001/tcp/4001/ipfs/QmSoLueR4xBeUbY9WZ9xGUUxunbKWcrNFTDAadQJmocnWm",
            "/ip6/2604:a880:1:20::1d9:6001/tcp/4001/ipfs/QmSoLju6m7xTh3DuokvT3886QRYqxAzb1kShaanJgW36yx",
            "/ip6/2604:a880:1:20::1f9:9001/tcp/4001/ipfs/QmSoLnSGccFuZQJzRadHn95W2CrSFmZuTdDWP8HXaHca9z",
            "/ip6/2604:a880:1:20::203:d001/tcp/4001/ipfs/QmSoLPppuBtQSGwKDZT2M73ULpjvfd3aZ6ha4oFGL1KrGM",
            "/ip6/2604:a880:800:10::4a:5001/tcp/4001/ipfs/QmSoLV4Bbm51jM9C4gDYZQ9Cy3U6aXMJDAbzgu2fzaDs64",
            "/ip6/2a03:b0c0:0:1010::23:1001/tcp/4001/ipfs/QmSoLer265NRgSp2LA3dPaeykiS1J6DifTC88f5uVQKNAd",
            "/ip6/2a03:b0c0:1:d0::e7:1/tcp/4001/ipfs/QmSoLMeWqB7YGVLJN3pNLQpmmEk35v6wYtsMGLzSr5QBU3"
        ]
    },
    EXPERIMENTAL: {
        pubsub: true
    }
})

var nodeAdress

ipfs.once('ready', () => ipfs.id((err, info) => {
    if (err) { throw err }
    nodeAdress = info.id
    document.getElementById('header').innerHTML += '<img src=https://robohash.org/' + nodeAdress + '.png height=100%>' + nodeAdress
    ipfs.config.get((err, config) => {
        if (err) {
            throw err
        }
        console.log(config)
    })
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