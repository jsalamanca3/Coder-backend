import { dirname } from "path";
import { fileURLToPath } from "url";
import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken';

export const __dirname = dirname(fileURLToPath(import.meta.url));

/* bcrypt */

export const hashData = async (data) => {
    const hash = await bcrypt.hash(data, 10);
    return hash;
};

export const compareData = async (data, hashData) => {
    return bcrypt.compare(data, hashData);
};

/* Token */

const PRIVATE_KEY = "SOYUNACLAVESECRETA";

export const generateToken = (user) => {
    const token = jwt.sign({user}, PRIVATE_KEY, {expiresIn: '24'})
    return token;
};

export const authToken = (req,res,next) => {
    const authHeader = req.header.authorization;
    if(!authHeader) return re.status(401).send({error: "No sea autenticado"})

    const token = authHeader.split( ' ' )[1];
    jwt.verify(token, PRIVATE_KEY, (error, credentials) => {
        if(error) return res.status(403).send({error: "No tienes autoización"})
        req.user = credentials.user;
        next();
    })
};