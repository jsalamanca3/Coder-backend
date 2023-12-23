import dotenv from "dotenv";

dotenv.config();

export default {
    mongo_uri: process.env.MONGODB_URI,
    github_client_id: process.env.GITHUB_CLIENT_ID,
    github_client_secret: process.env.GITHUB_CLIENT_SECRET,
    google_client_id: process.env.GOOGLE_CLIENT_ID,
    google_client_secret: process.env.GOOGLE_CLIENT_SECRET,
    session_secret: process.env.SESSION_SECRET,
    jwt_secret: process.env.JWT_SECRET,
    mail_user: process.env.MAIL_USER,
    mail_password: process.env.MAIL_PASSWORD,
    environment: process.env.ENVIRONMENT,
};