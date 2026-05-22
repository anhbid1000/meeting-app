require('dotenv').config();
const { v2: cloudinary } = require('cloudinary');

console.log("CLOUDINARY_URL:", process.env.CLOUDINARY_URL ? "Exists" : "Missing");

cloudinary.config({
  cloudinary_url: process.env.CLOUDINARY_URL
});

cloudinary.api.resources({ max_results: 1 })
  .then(res => console.log('Ping OK:', res.resources.length))
  .catch(err => console.error('Ping Error:', err));
