import express from 'express';
import dotenv from 'dotenv';
import {connectDB} from "./config/db.js";
import productRoute from "./routes/photo.route.js";
import path from "path";
import authRoute from "./routes/auth.route.js";

dotenv.config()

const app = express();
app.use(express.json());
const PORT = process.env.PORT || 3000;

app.use('/api/photos', productRoute);
app.use('/api/auth', authRoute);
app.use('/photos', express.static(path.join(process.cwd(), 'public/photos')));
app.use(express.urlencoded({ extended: true }));

app.listen(PORT, () => {
    connectDB();
    console.log(`Server started at  http://localhost:${PORT}`);
});