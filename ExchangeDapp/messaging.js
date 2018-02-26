// const Ipfs = require('ipfs');
// const Orbit = require('orbit_');

// const ipfs = new Ipfs();
// const orbit = new Orbit(ipfs);

const channel = 'AChannel';

// orbit.events.on('connected', (network) => {
//     console.log(`-!- Connected to ${network.name}`)
//     orbit.join(channel)
//   })
  
//   orbit.events.on('joined', (channel) => {
//     orbit.send(channel, "/me is now caching this channel")
//     console.log(`-!- Joined #${channel}`)
//   })
  
//   // Listen for new messages
//   orbit.events.on('message', (channel, post) => {
//     console.log(`[${post.meta.ts}] < ${post.meta.from.name}> ${post.content}`)
//   })
  
//   // Connect to Orbit network
//   orbit.connect('Example Bot')
//     .catch((e) => logger.error(e))