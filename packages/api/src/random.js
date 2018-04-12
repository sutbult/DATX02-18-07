// Try to fix randomness by mousemovement

// var io = require("socket.io");

// var socket = io.connect('http://localhost:3000');

// console.log("Here");

// function mouse_movement(){
//     socket.on('connect', function () {
//         socket.emit('client_connected', pl);
//       });
// }

//Temp function
function randomNumber(){
    return Math.floor(100000000000 + Math.random() * 900000000000);
}


module.exports = {randomNumber};