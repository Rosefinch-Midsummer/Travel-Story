import express from "express"
import protectRoute from "../middleware/protectRoute.js";
import upload from "../utils/multer.js";

import {
  addStory,
  editStory,
  // deleteStory,
  getAllStories,
  imageUpload,
  // imageDelete,
  searchStory,
  updateStoryPinned,
  filterStoryByDateRange,
} from "../controllers/travelStory.controller.js"


const router = express.Router()


router.post("/add-story", protectRoute, addStory)
router.put("/edit-story/:id", protectRoute, editStory)
// router.delete("/delete-story/:id", protectRoute, deleteStory)
router.get("/get-all-stories", protectRoute, getAllStories)
router.post("/image-upload", upload.single("image"), imageUpload)
// router.delete("/image-delete", imageDelete)
// router.delete("/delete/:noteId", protectRoute, deleteNote)
router.put("/update-story-pinned/:id", protectRoute, updateStoryPinned)
router.get("/search", protectRoute, searchStory)
router.get("/travel-stories/filter", protectRoute, filterStoryByDateRange)

export default router