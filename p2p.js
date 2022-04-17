const crypto = require("crypto");
const Swarm = require("discovery-swarm");
const defaults = require("dat-swarm-defaults");
const getPort = require("get-port");

// Set variables to hold an object with the peers and connection sequence
const peers = {};
let connSeq = 0;

//choose a channel name that all nodes will be connecting to
let channel = "myBlockchain";

const myPeerId = crypto.randomBytes(32);
console.log("myPeerId: " + myPeerId.toString("hex"));

// generate a config object that holds peer ID
const config = defaults({
  id: myPeerId,
});

// initialize swarm library using config as object
const swarm = Swarm(config);

(async () => {
  // listen on the random port selected
  const port = await getPort();

  swarm.listen(port);
  console.log("Listening port: " + port);

  swarm.join(channel);
  swarm.on("connection", (conn, info) => {
    const seq = connSeq;
    const peerId = info.id.toString("hex");
    console.log(`Connected #${seq} to peer: ${peerId}`);
    if (info.initiator) {
      try {
        // use setKeepAlive to ensure the network connection stays with other peers
        conn.setKeepAlive(true, 600);
      } catch (exception) {
        console.log("exception", exception);
      }
    }

    // Once you receive a data message on the P2P network, you parse the data using JSON.parse
    conn.on("data", (data) => {
      let message = JSON.parse(data);
      console.log("----------- Received Message start -------------");
      console.log(
        "from: " + peerId.toString("hex"),
        "to: " + peerId.toString(message.to),
        "my: " + myPeerId.toString("hex"),
        "type: " + JSON.stringify(message.type)
      );
      console.log("----------- Received Message end -------------");
    });

    /*  
         listen to a close event, which will indicate that you 
         lost a connection with peers, so you can take action, such as delete
         the peers from your peers ist object. 
       */
    conn.on("close", () => {
      console.log(`Connection ${seq} closed, peerId: ${peerId}`);
      if (peers[peerId].seq === seq) {
        delete peers[peerId];
      }
    });

    if (!peers[peerId]) {
      peers[peerId] = {};
    }
    peers[peerId].conn = conn;
    peers[peerId].seq = seq;
    connSeq++;
  });
})();

// using a setTimeout Node.js native function to send a message after ten seconds to any available peers
setTimeout(function () {
  writeMessageToPeers("hello", null);
}, 10000);

// writeMessageToPeers method will be sending messages to all the connected peers
writeMessageToPeers = (type, data) => {
  for (let id in peers) {
    console.log("-------- writeMessageToPeers start -------- ");
    console.log("type: " + type + ", to: " + id);
    console.log("-------- writeMessageToPeers end ----------- ");
    sendMessage(id, type, data);
  }
};

// writeMessageToPeerToId, that will be sending the message to a specific peer ID
writeMessageToPeerToId = (toId, type, data) => {
  for (let id in peers) {
    if (id === toId) {
      console.log("-------- writeMessageToPeerToId start -------- ");
      console.log("type: " + type + ", to: " + toId);
      console.log("-------- writeMessageToPeerToId end ----------- ");
      sendMessage(id, type, data);
    }
  }
};

/* 
   sendMessage is a generic method that we will be using to send a
   message formatted with the params you would like to pass and includes the
   following:
     – to/from: The peer ID you are sending the message from and to
     – type: The message type
     – data: Any data you would like to share on the P2P network 
*/

sendMessage = (id, type, data) => {
  peers[id].conn.write(
    JSON.stringify({
      to: id,
      from: myPeerId,
      type: type,
      data: data,
    })
  );
};
