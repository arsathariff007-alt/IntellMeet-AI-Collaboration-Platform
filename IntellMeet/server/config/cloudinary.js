const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure Cloudinary with environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Set up storage engine targeting an 'avatars' folder
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'intellmeet_avatars',
    allowed_formats: ['jpg', 'jpeg', 'png'],
    transformation: [{ width: 500, height: 500, crop: 'limit' }], // Automatically resize for profile optimization
  },
});

const upload = multer({ storage: storage });

module.exports = upload;
