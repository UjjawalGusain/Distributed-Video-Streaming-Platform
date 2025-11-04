import express from "express"
import cors from "cors"
import dbConnect from "./db/dbConnect";
import dotenv from "dotenv"
import path  from "path";
import authRouter from "./routes/auth.route"

dotenv.config({ path: path.resolve(__dirname, '../.env') });


const app = express()
dbConnect();
// app.use(cors({
//     origin: process.env.CORS_ORIGIN,
//     credentials: true,
// }))


app.use(express.static("public"))
app.use(express.json());

app.use('/api/auth', authRouter);


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});