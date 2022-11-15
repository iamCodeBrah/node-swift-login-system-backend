import express, { Request, Response, NextFunction, Router } from "express";
const router: Router = express.Router();

const validateUserFields = require('../helpers/validation_helper').validateUserFields;

router.post('/create-account', validateUserFields, (req: Request, res: Response, next: NextFunction) => {
    const { email, username, password }: { email: string, username: string, password: string } = req.body;




    res.json({ email, username, password });
});

module.exports = router;