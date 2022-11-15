import express, { Request, Response, NextFunction, Router } from "express";
const router: Router = express.Router();

const auth_functions = require('../functions/auth_functions');

const validateUserFields = require('../helpers/validation_helper').validateUserFields;

router.post('/create-account', validateUserFields, async (req: Request, res: Response, next: NextFunction) => {
    const { email, username, password }: { email: string, username: string, password: string } = req.body;

    try {
        await auth_functions.saveUser(email, username, password);
        auth_functions.createAndAddJwtToRes(email, username, res);
        res.status(200).json({ success: 'Successfully registered user' }); return;
    } catch (err) {
        res.status(500).json({ error: err }); return;
    }

    res.json({ email, username, password });
});

module.exports = router;