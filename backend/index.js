import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import fs from "fs";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import express from 'express';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
import dotenv from "dotenv";

import authRoutes from "./routes/auth.routes.js";
import travelStoryRoutes from "./routes/travelStory.routes.js";

import connectToMongoDB from "./db/connectToMongoDB.js";
import protectRoute from "./middleware/protectRoute.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

const app = express();
app.use(cookieParser());
app.use(express.json());
app.use(cors({ origin: "*" }));

app.delete("/image-delete", async (req, res) => {
	const { imageUrl } = req.query;
	if (!imageUrl) {
		return res.status(400).json({ error: true, message: "imageUrl parameter is required" });
	}
	try {
		// Extract the filename from the imageUrl
		const filename = path.basename(imageUrl);
		// Define the file path
		const filePath = path.join(__dirname, "uploads", filename);
		// Check if the file exists
		if (fs.existsSync(filePath)) {
			// Delete the file from the uploads folder
			fs.unlinkSync(filePath);
			res.status(200).json({ message: "Image deleted successfully" });
		} else {
			res.status(200).json({ error: true, message: "Image not found" })
		}
	} catch (error) {
		res.status(500).json({ error: true, message: error.message })
	}
});

import mongoose from "mongoose"; // 确保导入 mongoose
import travelStory from "./models/travelStory.model.js";
app.delete("/delete-story/:id", protectRoute, async (req, res) => {
	const { id } = req.params;
	const userId = req.user._id; // 直接获取 _id

	// console.log("here is start");
	// console.log("id", id);
	// console.log("userId", userId);

	try {
		// 将 userId 转换为 ObjectId
		const storyId = new mongoose.Types.ObjectId(id);
		const userObjectId = new mongoose.Types.ObjectId(userId);

		// Find the travel story by ID and ensure it belongs to the authenticated user
		const Story = await travelStory.findOne({ _id: storyId, userId: userObjectId });
		// console.log(Story);
		
		if (!Story) {
			return res.status(404).json({ error: true, message: "Travel story not found" });
		}

		await Story.deleteOne({ _id: storyId, userId: userObjectId });
		// Extract the filename from the imageUrl
		const imageUrl = Story.imageUrl;
		const filename = path.basename(imageUrl);

		// Define the file path
		const filePath = path.join(__dirname, "uploads", filename);

		// Delete the image file from the uploads folder
		fs.unlink(filePath, (err) => {
			if(err){
				console.log("Failed to delete image file:", err);
			}
		});
		res.status(200).json({ story: Story, message: "Delete Successfully" });

	} catch (error) {
		res.status(500).json({ error: true, message: error.message });
	}
});


// Serve static files from the uploads and assets directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/assets", express.static(path.join(__dirname, "assets")));

app.use("/api/auth", authRoutes);
app.use("/api", travelStoryRoutes);



app.listen(PORT, () => {
	connectToMongoDB();
	console.log(`Server Running on port ${PORT}`);
});

// app.listen(8000);
// export default app;



// import path from "path";
// import express from "express";
// import dotenv from "dotenv";
// import cookieParser from "cookie-parser";

// import authRoutes from "./routes/auth.routes.js";
// import messageRoutes from "./routes/message.routes.js";
// import userRoutes from "./routes/user.routes.js";

// import connectToMongoDB from "./db/connectToMongoDB.js";
// import { app, server } from "./socket/socket.js";

// dotenv.config();

// const __dirname = path.resolve();
// // PORT should be assigned after calling dotenv.config() because we need to access the env variables. Didn't realize while recording the video. Sorry for the confusion.
// const PORT = process.env.PORT || 5000;

// app.use(express.json()); // to parse the incoming requests with JSON payloads (from req.body)
// app.use(cookieParser());

// app.use("/api/auth", authRoutes);
// app.use("/api/messages", messageRoutes);
// app.use("/api/users", userRoutes);

// app.use(express.static(path.join(__dirname, "/frontend/dist")));

// app.get("*", (req, res) => {
// 	res.sendFile(path.join(__dirname, "frontend", "dist", "index.html"));
// });

// server.listen(PORT, () => {
// 	connectToMongoDB();
// 	console.log(`Server Running on port ${PORT}`);
// });

