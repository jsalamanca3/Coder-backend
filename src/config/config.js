import dotenv from "dotenv";

dotenv.config();

export default {
    mongo_uri: process.env.MONGODB_URI,
    github_client_id: process.env.GITHUB_CLIENT_ID,
    github_client_secret: process.env.GITHUB_CLIENT_SECRET,
    jwt_secret: process.env.JWT_SECRET,
};