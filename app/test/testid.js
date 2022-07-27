mid = require("node-machine-id")

// Asyncronous call with async/await or Promise

// async function getMachineId() {
//     let id = await machineId();

// }

// machineId().then((id) => {

// })

// Syncronous call

//let id = mid.machineIdSync()
// // id = c24b0fe51856497eebb6a2bfcd120247aac0d6334d670bb92e09a00ce8169365
let id = mid.machineIdSync({ original: true })
// // id = 98912984-c4e9-5ceb-8000-03882a0485e4
console.log(id);


const si = require('systeminformation');

// promises style - new since version 3
si.system()
    .then(data => console.log(data))
    .catch(error => console.error(error));

si.blockDevices()
    .then(data => console.log(data))
    .catch(error => console.error(error));