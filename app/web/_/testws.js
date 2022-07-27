
// let socket = new WebSocket("ws://localhost:8080");
let socket = new WebSocket("ws://192.168.1.15:8080");

socket.onopen = function (e) {
  // alert("[open] Connection established");
  // alert("Sending to server");
  socket.send("My name is John " + new Date().toISOString());
};
socket.onmessage = function (event) {
  console.log(event.data);
  // alert(`[message] Data received from server: ${event.data}`);
};
socket.onclose = function (event) {
  if (event.wasClean) {
    console.log(`[close] Connection closed cleanly, code=${event.code} reason=${event.reason}`);
  } else {
    // e.g. server process killed or network down
    // event.code is usually 1006 in this case
    console.log('[close] Connection died');
  }
};

socket.onerror = function (error) {
  alert(`[error] ${error.message}`);
};