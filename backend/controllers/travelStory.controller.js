import travelStory from "../models/travelStory.model.js";
import User from "../models/user.model.js";

// import fs from "fs";
// import path from "path";
// import { fileURLToPath } from 'url';
// import { dirname } from 'path';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

export const getUser = async (req, res) => {
	const { userId } = req.user;
	const isUser = await User.findOne({ _id: userId });

	if (!isUser) {
		return res.sendStuatus(401);
	}
	return res.json({
		user: isUser,
		message: "",
	});
}



export const addStory = async (req, res) => {
	const { title, story, visitedLocation, imageUrl, visitedDate } = req.body;

	if (!req.user) {
		return res.status(401).json({ error: "Unauthorized" });
	}

	const userId = req.user._id; // 直接获取 _id

	if (!title || !story || !visitedLocation || !imageUrl || !visitedDate) {
		return res.status(400).json({ error: true, message: "All fields are required" });
	}

	const parsedVisitedDate = new Date(parseInt(visitedDate));

	try {
		const newTravelStory = new travelStory({
			title,
			story,
			visitedLocation,
			userId,
			imageUrl,
			visitedDate: parsedVisitedDate,
		});

		await newTravelStory.save();

		res.status(201).json({
			story: newTravelStory,
			message: "TravelStory added successfully",
		});
	} catch (error) {
		res.status(400).json({ error: true, message: error.message });
	}
};


export const editStory = async (req, res) => {
	const { id } = req.params;
	const { title, story, visitedLocation, imageUrl, visitedDate } = req.body;
	// const { userId } = req.user;
	const userId = req.user._id; // 直接获取 _id

	if (!title || !story || !visitedLocation || !visitedDate) {
		return res.status(400).json({ error: true, message: "All fields are required" });
	}

	const parsedVisitedDate = new Date(parseInt(visitedDate));

	try {
		// Find the travel story by ID and ensure it belongs to the authenticated user
		const Story = await travelStory.findOne({ _id: id, userId: userId });
		if (!Story) {
			return res.status(404).json({ error: true, message: "Travel story not found" });
		}

		const placeholderImgUrl = `http://localhost:5000/assets/placeholder.jpg`;

		Story.title = title;
		Story.story = story;
		Story.visitedLocation = visitedLocation;
		Story.imageUrl = imageUrl || placeholderImgUrl;
		Story.visitedDate = parsedVisitedDate;

		await Story.save();

		res.status(200).json({ story: Story, message: "Update Successfully" });

	} catch (error) {
		res.status(500).json({ error: true, message: error.message });
	}
}
// export const deleteStory = async (req, res) => {
// 	const { id } = req.params;
// 	// const { userId } = req.user;
// 	const userId = req.user._id; // 直接获取 _id

// 	try {
// 		// Find the travel story by ID and ensure it belongs to the authenticated user
// 		const Story = await travelStory.findOne({ _id: id, userId: userId });
// 		if (!Story) {
// 			return res.status(404).json({ error: true, message: "Travel story not found" });
// 		}

// 		await Story.deleteOne({ _id: id, userId: userId });
// 		// Extract the filename from the imageUrl
// 		const imageUrl = Story.imageUrl;
// 		const filename = path.basename(imageUrl);

// 		// Define the file path
// 		const filePath = path.join(__dirname, "uploads", filename);

// 		// Delete the image file from the uploads folder
// 		fs.unlink(filePath, (err) => {
// 			if(err){
// 				console.log("Failed to delete image file:", err);
// 			}
// 		})
// 		res.status(200).json({ story: Story, message: "Delete Successfully" });

// 	} catch (error) {
// 		res.status(500).json({ error: true, message: error.message });
// 	}
// }

export const getAllStories = async (req, res, next) => {
	const userId = req.user.id

	try {
		const stories = await travelStory.find({ userId: userId }).sort({ isPinned: -1 })

		res.status(200).json({
			success: true,
			message: "All stories retrived successfully",
			stories,
		})
	} catch (error) {
		next(error)
	}
}

export const imageUpload = async (req, res) => {

	try {
		if (!req.file) {
			return res.status(400).json({ error: true, message: "No image uploaded" })
		}

		const imageUrl = `http://localhost:5000/uploads/${req.file.filename}`;
		res.status(200).json({ imageUrl });
	} catch (error) {
		res.status(500).json({ error: true, message: error.message })
	}
}
// export const imageDelete = async (req, res) => {
// 	const { imageUrl } = req.query;
// 	if (!imageUrl) {
// 		console.log("here1")
// 		return res.status(400).json({ error: true, message: "imageUrl parameter is required" });
// 	}
// 	try {
// 		// Extract the filename from the imageUrl
// 		const filename = path.basename(imageUrl);
// 		console.log("here2")
// 		// Define the file path
// 		const filePath = path.join(__dirname, "uploads", filename);
// 		console.log("here3")
// 		// Check if the file exists
// 		if (fs.existsSync(filePath)) {
// 			// Delete the file from the uploads folder
// 			fs.unlinkSync(filePath);
// 			res.status(200).json({ message: "Image deleted successfully" });
// 		} else {
// 			res.status(200).json({ error: true, message: "Image not found" })
// 		}
// 		console.log("here4")
// 	} catch (error) {
// 		res.status(500).json({ error: true, message: error.message })
// 	}
// }



// export const deleteNote = async (req, res, next) => {
//   const noteId = req.params.noteId

//   const note = await Note.findOne({ _id: noteId, userId: req.user.id })

//   if (!note) {
//     return next(errorHandler(404, "Note not found"))
//   }

//   try {
//     await Note.deleteOne({ _id: noteId, userId: req.user.id })

//     res.status(200).json({
//       success: true,
//       message: "Note deleted successfully",
//     })
//   } catch (error) {
//     next(error)
//   }
// }

export const updateStoryPinned = async (req, res) => {

	const { id } = req.params;
	const { isFavourite } = req.body;
	// const { userId } = req.user;
	const userId = req.user._id; // 直接获取 _id

	try {
		const Story = await travelStory.findOne({ _id: id, userId: userId });

		if (!Story) {
			return res.status(404).json({ error: true, message: "Travel story not found" })
		}

		Story.isFavourite = isFavourite;

		await Story.save();

		res.status(200).json({
			story: Story,
			message: "Updated successfully",
		})
	} catch (error) {
		res.status(500).json({ error: true, message: error.message });
	}
}


export const searchStory = async (req, res) => {

	const { query } = req.query
	const userId = req.user._id; // 直接获取 _id

	if (!query) {
		return res.status(404).json({ error: true, message: "Search query is required" });
	}

	try {
		const matchingStories = await travelStory.find({
			userId: userId,
			$or: [
				{ title: { $regex: new RegExp(query, "i") } }, //{title: {$regex: query, $options: "i"}}
				{ story: { $regex: new RegExp(query, "i") } },
				{ visitedLocation: { $regex: new RegExp(query, "i") } },
			],
		}).sort({ isFavourite: -1 })

		res.status(200).json({
			// message: "Stories matching the search query retrieved successfully",
			stories: matchingStories,
		})
	} catch (error) {
		res.status(500).json({ error: true, message: error.message });
	}
}



// export const searchNote = async (req, res, next) => {
//   const { query } = req.query

//   if (!query) {
//     return next(errorHandler(400, "Search query is required"))
//   }

//   try {
//     const matchingNotes = await Note.find({
//       userId: req.user.id,
//       $or: [
//         { title: { $regex: new RegExp(query, "i") } },
//         { content: { $regex: new RegExp(query, "i") } },
//       ],
//     })

//     res.status(200).json({
//       success: true,
//       message: "Notes matching the search query retrieved successfully",
//       notes: matchingNotes,
//     })
//   } catch (error) {
//     next(error)
//   }
// }

export const filterStoryByDateRange = async (req, res) => {

	const { startDate, endDate } = req.query
	const userId = req.user._id; // 直接获取 _id

	try {
		// Convert startDate and endDate from milliseconds to Date objects
		const start = new Date(parseInt(startDate));
		const end = new Date(parseInt(endDate));

		// Find travel stories that belong to the authenticated user and fall within the date range
		const filterdStories = await travelStory.find({
			userId: userId,
			visitedDate: { $gte: start, $lte: end },
		}).sort({ isFavourite: -1 })

		res.status(200).json({
			// message: "Stories matching the search query retrieved successfully",
			stories: filterdStories,
		})
	} catch (error) {
		res.status(500).json({ error: true, message: error.message });
	}
}




