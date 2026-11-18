import type { Request, Response } from "express";
import { db } from "../prisma/db.js";
import { sendToUser } from "../services/socketService.js";
import { and, or } from "@prisma/orm-postgres/orm-client";

export const sendMessage = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const senderId = req.authUser?.id;
        const receiverId = Number(req.params.receiverId);
        const { content } = req.body;

        if (!senderId) {
            res.status(401).json({ message: "Unauthorized." });
            return;
        }

        if (!Number.isInteger(receiverId) || receiverId <= 0) {
            res.status(400).json({ message: "Invalid receiver ID." });
            return;
        }

        if (senderId === receiverId) {
            res.status(400).json({ message: "You cannot message yourself." });
            return;
        }

        if (
            typeof content !== "string" ||
            !content.trim() ||
            content.trim().length > 2000
        ) {
            res.status(400).json({
                message: "Message must contain 1–2000 characters."
            });
            return;
        }

        const receiver = await db.orm.public.User
            .whereUnique({ id: receiverId })
            .first();

        if (!receiver || !receiver.isActive) {
            res.status(404).json({
                message: "Receiver not found or inactive."
            });
            return;
        }

        const message = await db.orm.public.ChatMessage.create({
            senderId,
            receiverId,
            content: content.trim()
        });

        // Notify the receiver in real time
        sendToUser(receiverId, "new_message", message);

        res.status(201).json({
            message: "Message sent successfully.",
            data: message
        });

    } catch (error) {
        console.error("Send message error:", error);
        res.status(500).json({
            message: "Failed to send message."
        });
    }
};

export const getMessages = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const userId = req.authUser?.id;
        const otherUserId = Number(req.params.userId);

        if (!userId) {
            res.status(401).json({ message: "Unauthorized." });
            return;
        }

        if (
            !Number.isInteger(otherUserId) ||
            otherUserId <= 0 ||
            otherUserId === userId
        ) {
            res.status(400).json({ message: "Invalid user ID." });
            return;
        }

        const page = Math.max(1, Number(req.query.page) || 1);
        const limit = Math.min(
            100,
            Math.max(1, Number(req.query.limit) || 20)
        );

        const messages = await db.orm.public.ChatMessage
            .where((message) =>
                or(
                    and(
                        message.senderId.eq(userId),
                        message.receiverId.eq(otherUserId)
                    ),
                    and(
                        message.senderId.eq(otherUserId),
                        message.receiverId.eq(userId)
                    )
                )
            )
            .orderBy((message) => message.createdAt.desc())
            .limit(limit)
            .offset((page - 1) * limit)
            .all();

        res.status(200).json({
            page,
            limit,
            data: messages
        });

    } catch (error) {
        console.error("Get messages error:", error);
        res.status(500).json({
            message: "Failed to retrieve messages."
        });
    }
};
export const getConversations = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const userId = req.authUser?.id;

        if (!userId) {
            res.status(401).json({ message: "Unauthorized." });
            return;
        }

        const messages = await db.orm.public.ChatMessage
            .where((message) =>
                or(
                    message.senderId.eq(userId),
                    message.receiverId.eq(userId)
                )
            )
            .orderBy((message) => message.createdAt.desc())
            .all();

        const conversationUserIds = [
            ...new Set(
                messages.map((message) =>
                    message.senderId === userId
                        ? message.receiverId
                        : message.senderId
                )
            )
        ];

        const conversations = await Promise.all(
            conversationUserIds.map(async (otherUserId) => {
                const user = await db.orm.public.User
                    .whereUnique({ id: otherUserId })
                    .first();

                if (!user || !user.isActive) return null;

                const latestMessage = messages.find(
                    (message) =>
                        (message.senderId === userId &&
                            message.receiverId === otherUserId) ||
                        (message.senderId === otherUserId &&
                            message.receiverId === userId)
                );

                return {
                    user: {
                        id: user.id,
                        name: user.name,
                        email: user.email
                    },
                    latestMessage
                };
            })
        );

        res.status(200).json({
            data: conversations.filter(Boolean)
        });

    } catch (error) {
        console.error("Get conversations error:", error);
        res.status(500).json({
            message: "Failed to retrieve conversations."
        });
    }
};