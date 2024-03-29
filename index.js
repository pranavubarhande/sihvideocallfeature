const express = require('express');
const app = express();
const server = require("http").createServer(app);
const cors = require("cors");
const path = require('path');
app.use(express.static(path.join(__dirname, 'client', 'build')));
const io = require("socket.io")(server, {
	cors: {
		origin: "*",
		methods: [ "GET", "POST" ]
	}
});

app.use(cors());

const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => {
	res.send('Running');
});
app.get('/videocall', (req, res) => {
	// Send the 'index.html' file as the response 
	console.log('vidocall');
	res.sendFile(path.join(__dirname, 'client', 'build', 'index.html'));
  });

io.on("connection", (socket) => {
	socket.emit("me", socket.id);

	socket.on("disconnect", () => {
		socket.broadcast.emit("callEnded")
	});

	socket.on("callUser", ({ userToCall, signalData, from, name }) => {
		io.to(userToCall).emit("callUser", { signal: signalData, from, name });
	});

	socket.on("answerCall", (data) => {
		io.to(data.to).emit("callAccepted", data.signal)
	});
});

server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
