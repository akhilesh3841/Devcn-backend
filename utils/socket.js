import { Server } from "socket.io";
import crypto from "crypto";
import { Chatstore } from "../models/chat.js";
import { Connectionreq } from "../models/connectionreq.js";

// 🔐 Generate consistent room ID for any user pair
const secretroom = (userId, targetuserid) => {
    return crypto
        .createHash("sha256")
        .update([userId, targetuserid].sort().join("_"))
        .digest("hex");
};

const intializesocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: "http://localhost:5173", // frontend
            credentials: true,
        },
    });

    io.on("connection", (socket) => {
        console.log("New client connected");

        socket.on("joinChat", ({ firstName, userId, targetuserid }) => {
            const room = secretroom(userId, targetuserid);
            console.log(`${firstName} joined room ${room}`);
            socket.join(room);
        });

        socket.on("sendMessage", async ({ firstName, userId, targetuserid, text }) => {
            const room = secretroom(userId, targetuserid);
            console.log(`${firstName}: ${text}`);

            try {

                   const existingreq = await Connectionreq.findOne({
                    $or: [
                         { fromUserId: userId, toUserId: targetuserid, status: "accepted" },
                      { fromUserId: targetuserid, toUserId: userId, status: "accepted" }
                    ]
                   });

    if (!existingreq) {
      return socket.emit("error", { message: "You are not connected with this user." });
    }


                let chat = await Chatstore.findOne({
                    participants: { $all: [userId, targetuserid] }
                });


        


                if (!chat) {
                    chat = new Chatstore({
                        participants: [userId, targetuserid],
                        messages: [],
                    });
                }

                chat.messages.push({
                    senderId: userId,
                    text,
                });

                await chat.save();

                // 🔁 Send to both users in the room
                io.to(room).emit("Message Recieved", { firstName, text });
            } catch (error) {
                console.error("Error saving chat:", error);
            }
        });

        socket.on("disconnect", () => {
            console.log("Client disconnected");
        });
    });
};

export default intializesocket;
