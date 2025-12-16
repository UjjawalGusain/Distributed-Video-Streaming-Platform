import express from "express"
import cors from "cors"
import dbConnect from "./db/dbConnect";

import authRouter from "./routes/auth.route"
import videoRouter from "./routes/video.route"
import videoMetadataRouter from "./routes/videoMetadata.route"
import reactionRouter from "./routes/reaction.route"
import subscriptionRouter from "./routes/subscription.route"
import commentRouter from "./routes/comment.route"
import userRouter from "./routes/user.route"
import notificationRouter from "./routes/notification.route"

const app = express()
dbConnect();
// app.use(cors({
//     origin: process.env.CORS_ORIGIN,
//     credentials: true,
// }))
app.use(cors({ origin: ["http://localhost:3000", "http://localhost:5001"] }));

app.use(express.static("public"))
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

app.use('/api/auth', authRouter);
app.use('/api/video', videoRouter);
app.use('/api/video-metadata', videoMetadataRouter);
app.use('/api/reaction', reactionRouter);
app.use('/api/subscription', subscriptionRouter);
app.use('/api/comment', commentRouter);
app.use('/api/user', userRouter);
app.use('/api/notification', notificationRouter);


const PORT = Number(process.env.PORT) || 5000;

app.listen(PORT, "0.0.0.0", () => {
 console.log(`Server running on port ${PORT}`);
});
