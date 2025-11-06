import multer from "multer";
const storage = multer.memoryStorage();


// For the video
export const multerUpload = multer();


// For the thumbnail
export const thumbnailUpload = multer({
  storage,
  limits: { fileSize: 3 * 1024 * 1024 }, // 3MB max file size
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  },
});

