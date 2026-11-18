import { Server } from "socket.io";
import type { Server as HttpServer } from "http";
import { socketAuth } from "../middleware/socketAuth.js";

let io: Server;

export const initializeSocket = (
    httpServer: HttpServer
): Server => {

    io = new Server(httpServer, {
        cors: {
            origin: "http://localhost:3000",
            methods: ["GET", "POST"]
        }
    });

    // Authenticate before allowing connections
    io.use(socketAuth);

    io.on("connection", (socket) => {
    const user = socket.data.user;

    console.log(`${user.name} connected:`, socket.id);

    // Join the user's personal room
    socket.join(`user:${user.id}`);

    console.log(`User ${user.id} joined room user:${user.id}`);

    socket.on("disconnect", () => {
        console.log(`${user.name} disconnected.`);
    });
});

    return io;
};

export const getIO = (): Server => {
    if (!io) {
        throw new Error("Socket.IO has not been initialized.");
    }

    return io;
};