let io;

module.exports = {
    init: (httpServer) => {
        io = require('socket.io')(httpServer, {
            cors: {
                origin: "*", // Adjust this in production to match your frontend URL
                methods: ["GET", "POST"]
            }
        });
        
        io.on('connection', (socket) => {
            console.log('⚡ New client connected:', socket.id);
            
            socket.on('disconnect', () => {
                console.log('❌ Client disconnected:', socket.id);
            });
        });

        return io;
    },
    getIO: () => {
        if (!io) {
            throw new Error("Socket.io not initialized!");
        }
        return io;
    },
    emitEvent: (event, data) => {
        if (io) {
            io.emit(event, data);
        }
    }
};
