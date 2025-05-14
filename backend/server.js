import express from 'express';
import dotenv from 'dotenv';
import {connectDB} from "./config/db.js";
import productRoute from "./routes/product.route.js";

dotenv.config()

const app = express();
const PORT = process.env.PORT || 3000;

app.use("/api/photos", productRoute);

app.use(express.urlencoded({ extended: true }));

app.listen(PORT, () => {
    connectDB();
    console.log(`Server started at  http://localhost:${PORT}`);
});