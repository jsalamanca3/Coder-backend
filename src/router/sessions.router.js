import { Router } from "express";
import { authToken, generateToken } from "../utils";

const router = Router();

/* Token */

const users = []
router.post('/register', (req, res) => {
    const { name, email, password } = req.body;
    const exists = users.find(user => user.email===email);
    if(exists) return res.status(400).send({status:"error", error:"User already exists"});
    const user = {
        name,
        email,
        password
    }
    user.push(user);
    const access_token = generateToken(user);
    res.send({status:"success", access_token});
});

router.post('/login', (req, res) => {
    const {email,password} = req.body;
    const user = users.find(user => user.email===email&&user.password===password);
    if(!user) return res.status(400).send({staus:"error", error:"Invalid credentials"});
    const access_token = generateToken(user);
    res.send({status:"success", access_token});
});

router.get('/current', authToken,(req, res) => {
    res.send({status:"seccess", payload:req.user});
});

export default router;