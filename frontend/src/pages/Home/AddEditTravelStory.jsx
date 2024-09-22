import React, { useState } from "react"
import { MdAdd, MdClose, MdDeleteOutline, MdUpdate } from "react-icons/md"
import { toast } from "react-toastify"
import DateSeletor from "../../components/Input/DateSelector"
import ImageSelector from "../../components/Input/ImageSelector"
import TagInput from "../../components/Input/TagInput "
import moment from "moment"
import uploadImage from "../../utils/uploadImage";
import axiosInstance from "../../utils/axiosInstance";


const AddEditTravelStory = ({ onClose, storyInfo, type, getAllStories }) => {
    const [title, setTitle] = useState(storyInfo?.title || "");
    const [story, setStory] = useState(storyInfo?.story || "");
    const [storyImg, setStoryImg] = useState(storyInfo?.imageUrl || null);
    const [visitedLocation, setVisitedLocation] = useState(storyInfo?.visitedLocation || []);
    const [visitedDate, setVisitedDate] = useState(storyInfo?.visitedDate || null);

    const [error, setError] = useState("");

    // Add New Travel Story
    const addNewTravelStory = async () => {
        try {
            let imageUrl = "";
            // console.log("storyImg=", storyImg);
            // Upload image if present
            if (storyImg) {
                const imgUploadRes = await uploadImage(storyImg);
                // Get image URL
                imageUrl = imgUploadRes.imageUrl || "";
                console.log("imageUrl=", imageUrl);
            }
            const response = await axiosInstance.post("/api/add-story", {
                title,
                story,
                imageUrl: imageUrl || "",
                visitedLocation,
                visitedDate: visitedDate ? moment(visitedDate).valueOf() : moment().valueOf(),
            });

            if (response.data && response.data.story) {
                toast.success("Story Added Successfully!");
                // Refresh stories
                getAllStories();
                // Close modal or form
                onClose();
            }
        } catch (error) {
            if (error.response && error.response.data && error.response.data.message) {
                setError(error.response.data.message);
            } else {
                // Handle unexpected errors
                setError("An unexpected error occurred. Please try again.")
            }
        }
    }

    // Update Travel Story
    const updateTravelStory = async () => {
        const storyId = storyInfo._id;



        try {
            let imageUrl = "";

            let postData = {
                title,
                story,
                imageUrl: storyInfo.imageUrl || "",
                visitedLocation,
                visitedDate: visitedDate ? moment(visitedDate).valueOf() : moment().valueOf(),
            }

            if (typeof storyImg === "object") {
                // Upload New Image
                const imgUploadRes = await uploadImage(storyImg);
                imageUrl = imgUploadRes.imageUrl || "";
                postData = {
                    ...postData,
                    imageUrl: imageUrl,
                };
            }

            const response = await axiosInstance.put("/api/edit-story/" + storyId, postData);

            if (response.data && response.data.story) {
                toast.success("Story Updated Successfully!");
                // Refresh stories
                getAllStories();
                // Close modal or form
                onClose();
            }
        } catch (error) {
            if (error.response && error.response.data && error.response.data.message) {
                setError(error.response.data.message);
            } else {
                // Handle unexpected errors
                setError("An unexpected error occurred. Please try again.")
            }
        }
    }

    const handleAddOrUpdateClick = () => {
        // console.log(title, story, storyImg, visitedLocation, visitedDate);

        if (!title) {
            setError("Please enter the title.");
            return;
        }

        if (!story) {
            setError("Please enter the story.");
            return;
        }

        setError("");
        if (type === "edit") {
            updateTravelStory();
        } else {
            addNewTravelStory();
        }
    };

    // Delete story image and update the story
    const handleDeleteStoryImg = async () => {
        // Delete the image
        const deleteImgRes = await axiosInstance.delete("/image-delete", {
            params: {
                imageUrl: storyInfo.imageUrl,
            },
        });

        if (deleteImgRes.data) {
            const storyId = storyInfo._id;
            const postData = {
                title,
                story,
                imageUrl: "",
                visitedLocation,
                visitedDate: moment().valueOf(),
            };

            // Updating story
            const response = await axiosInstance.put(
                "/api/edit-story/" + storyId,
                postData
            );
            setStoryImg(null);
        }
    };

    return (

        <div className="relative">
            <div className="flex items-center justify-between">
                <h5 className="text-xl font-medium text-slate-700">
                    {type === "add" ? "Add Story" : "Update Story"}
                </h5>

                <div>
                    <div className="flex items-center gap-3 bg-cyan-50/50 p-2 rounded-l-lg">
                        {type === "add" ? (
                            <button className="btn-small" onClick={handleAddOrUpdateClick}>
                                <MdAdd className="text-lg" /> ADD STORY
                            </button>
                        ) : (
                            <>
                                <button className="btn-small" onClick={handleAddOrUpdateClick}>
                                    <MdUpdate className="text-lg" /> UPDATE STORY
                                </button>
                                {/* <button className="btn-small btn-delete" onClick={onClose}>
                                    <MdDeleteOutline className="text-lg" /> DELETE
                                </button> */}
                            </>
                        )}
                        <button
                            // className="w-10 h-10 rounded-full flex items-center justify-center absolute -top-3 -right-3 hover:bg-slate-50"
                            className=""
                            onClick={onClose}
                        >
                            <MdClose className="text-xl text-slate-400" />
                        </button>
                    </div>

                    {error && (
                        <p className="text-red-500 text-xs pt-2 text-right">{error}</p>
                    )}
                </div>
            </div>

            <div>
                <div className="flex-1 flex flex-col gap-2 pt-4">
                    <label className="input-label">TITLE</label>
                    <input
                        type="text"
                        className="text-2xl text-slate-950 outline-none"
                        placeholder="A Day at the Great Wall"
                        value={title}
                        onChange={({ target }) => setTitle(target.value)}
                    />

                    <div className="my-3">
                        <DateSeletor date={visitedDate} setDate={setVisitedDate} />
                    </div>

                    <ImageSelector
                        image={storyImg}
                        setImage={setStoryImg}
                        handleDeleteImg={handleDeleteStoryImg}
                    />

                    <div className="flex flex-col gap-2 mt-4">
                        <label className="input-label">STORY</label>

                        <textarea
                            type="text"
                            className="text-sm text-slate-950 outline-none bg-slate-50 p-2 rounded"
                            placeholder="YOUR STORY"
                            rows={10}
                            value={story}
                            onChange={({ target }) => setStory(target.value)}
                        />
                    </div>
                    <div className="pt-3">
                        <label className="input-label">VISITED LOCATIONS</label>
                        <TagInput tags={visitedLocation} setTags={setVisitedLocation} />
                    </div>

                    {/* <button
                        className="btn-primary font-medium mt-5 p-3"
                        onClick={handleAddNote}
                    >
                        {type === "edit" ? "UPDATE" : "ADD"}
                    </button>  */}
                </div>
            </div>
        </div>
    )
}

export default AddEditTravelStory