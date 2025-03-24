import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
  api_key: process.env.CN_API_KEY,
  api_secret: process.env.CN_API_SECRET,
  cloud_name: process.env.CN_NAME,
});

export default cloudinary;
