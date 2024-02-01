const Rcon = require('rcon')
const Discord = require('discord.js')
const JSONBig = require('json-bigint')
const options = require('./config.json')

let modCommands = [
  "say",
  "kick",
  "ban",
  "mute",
  "unban",
  "unmute"
]

let rcon = new Rcon(options.host, options.port, options.password)
let client = new Discord.Client();

// rcon.on('message', function(msg){
//   let message = JSON.parse(JSON.stringify(msg));

//   if(message.type === 'Chat')
//   {
//     message = JSONBig.parse(message.message);
//     client.channels.get(options.rconChannel).send('(' + message.UserId + ') ' + message.Message);
//   }
//   else if (message.identity === 10)
//   {
//     let info = JSON.parse(message.message)
//     let onlinePlayers = info.Players + info.Joining;
//     let queuedPlayers = info.Queued;
//     let maxPop = info.MaxPlayers
//     if (queuedPlayers) {
//       client.user.setActivity(`${onlinePlayers}/${maxPop} (${queuedPlayers} in queue)`, {type: 'PLAYING'});
//     }
//     else if (onlinePlayers < 20){
//       client.user.setActivity(options.defaultActivity, {type: 'PLAYING'});
//     }
//     else {
//       client.user.setActivity(`${onlinePlayers}/${maxPop}`, {type: 'PLAYING'});
//     }
//   }
//   else if (message.identity === -1)
//   {
//     messageToSend = message.message;
//     if (messageToSend.length < 1994){
//       if (messageToSend.length != 0) {
//         client.channels.get(options.reportChannel).send("```" + messageToSend.substring(0, 1994) + "```");
//       }
//     }
//     else {
//       while(messageToSend.length > 1994){
//         client.channels.get(options.reportChannel).send("```" + messageToSend.substring(0, 1994) + "```");
//         messageToSend = messageToSend.substring(1994);
//       }
//       client.channels.get(options.reportChannel).send("```" + messageToSend.substring(0, 1994) + "```");

//     }
//   }
// })


// Try RCON connection
function tryConnection()
{
  try
  {
    rcon.connect();
  }
  catch(e)
  {
    console.log('RCON unavailable');
    setTimeout(tryConnection, options.tryConnectionInterval);
  }
}

// Get server info
function getServerInfo()
{
  try
  {
    const response = rcon.send("ShowPlayers");
  }
  catch(e)
  {
    console.log("There is an error m8");
    tryConnection();
  }
}


// Listeners for connections/disconnections/errors
rcon.on('auth', function(str) {
  console.log(`auth: ${str}`);
  getServerInfo();
})

rcon.on('response', function(str) {
  console.log(`response: ${str}`);
})

rcon.on('server', function(str) {
  console.log(`server: ${str}`);

  if (str.includes('name,playeruid,steamid')) {
    players = str.split(/\r?\n/);
    players.shift();
    players = players.map(str => str.split(',')[0]);
    client.user.setActivity(`online: ${players.join(', ')}`);
    console.log('Set activity');
    rcon.disconnect();
    setInterval(() => {
      tryConnection();
    }, 1000 * 10);
  }
})

rcon.on('error', function(str) {
  console.log(`error: ${str}`);
})

rcon.on('end', function(str) {
  console.log(`end: ${str}`);
})


// Discord bot code
client.on("ready", () => {
  console.log("discord Ready");
  tryConnection();
});

// client.on("message", msg => {
//   if (msg.channel.id === options.rconChannel){
//     if (msg.member.roles.find(r => r.id === options.adminRole))
//     {
//       try {
//         rcon.run(msg.toString(), -1)
//       }
//       catch(e){
//         console.log("Error!");
//         tryConnection();
//       }
//     }
//     else if (msg.member.roles.find(r => r.id === options.modRole))
//     {
//       if (modCommands.indexOf(msg.toString().split(" ")[0]) > -1)
//       {
//         try {
//           rcon.run(msg.toString(), -1)
//         }
//         catch(e){
//           console.log("Error!");
//           tryConnection();
//         }
//       }
//     }
//   }
// });

client.login(options.token);
