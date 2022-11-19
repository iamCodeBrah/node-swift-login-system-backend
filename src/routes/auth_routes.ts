import express, { Request, Response, NextFunction, Router } from "express";
const router: Router = express.Router();

import { User } from "../models/User";

const hashing_helper = require('../helpers/hashing_helper');

const auth_functions = require('../functions/auth_functions');
const validateUserFields = require('../helpers/validation_helper').validateUserFields;
const hashPassword = require('../helpers/hashing_helper').hashPassword;

router.post('/create-account', validateUserFields, hashPassword,  async (req: Request, res: Response, next: NextFunction) => {
    const { email, username, password }: { email: string, username: string, password: string } = req.body;

    try {
        await auth_functions.saveUser(email, username, password);
        auth_functions.createAndAddJwtToRes(email, username, res);
        res.status(200).json({ success: 'Successfully registered user.' }); return;
    } catch (err) {
        res.status(500).json({ error: err }); return;
    }
});

router.post('/sign-in', async (req: Request, res: Response, next: NextFunction) => {
    const { email, password }: { email: string, password: string } = req.body;

    try {
        const user: User = await auth_functions.getUserForEmail(email);
        await hashing_helper.compareHash(user.password, password);
        auth_functions.createAndAddJwtToRes(user.email, user.username, res);
        res.status(200).json({ success: 'Successfully signed in user.' }); return;
    } catch (err) {
        res.status(500).json({ error: err }); return;
    }
});

module.exports = router;