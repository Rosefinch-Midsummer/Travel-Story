import multer, { diskStorage } from "multer";
import { extname } from 'path';

// Storage configuration
const storage = diskStorage({
    destination: function (req, file, cb){
        cb(null, "./uploads/"); // Destination folder for storing uploaded files
    },
    filename: function (req, file, cb){
        cb(null, Date.now() + extname(file.originalname)); //Unique filename
    },
});

// File filter to accept only images
const fileFilter = (req, file, cb) => {
    if(file.mimetype.startsWith("image/")){
        cb(null, true);
    }else{
        cb(new Error("Only images are allowed"), false);
    }
};

// Initialize multer instance
const upload = multer({storage, fileFilter});

export default upload;


