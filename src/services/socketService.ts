import { getIO } from "../config/socket.js";

export const sendToUser = (
    userId: number,
    event: string,
    data: unknown
): void => {
    getIO().to(`user:${userId}`).emit(event, data);
};