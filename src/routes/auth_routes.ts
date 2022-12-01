import express, { Request, Response, NextFunction, Router } from "express";
const router: Router = express.Router();
import { User } from "../models/User";

import { sendMail } from "../helpers/mail_helper";

const hashing_helper = require('../helpers/hashing_helper');
const auth_functions = require('../functions/auth_functions');
const validateUserFields = require('../helpers/validation_helper').validateUserFields;
const hashPassword = require('../helpers/hashing_helper').hashPassword;
const jwt = require('jsonwebtoken');
require('dotenv').config();

/*
    Create User Account
 */
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

/*
    Sign User In
*/
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

/*
    Forgot password - request email
 */
router.post('/forgot-password', async (req: Request, res: Response, next: NextFunction) => {
    const email: string = req.body.email;

    try {
        const user: User = await auth_functions.getUserForEmail(email);
        const confirmedEmail = user.email;

        const resetToken: string = jwt.sign({ confirmedEmail }, process.env.JWT_SECRET, { expiresIn: 900 });
        await auth_functions.savePasswordResetToken(confirmedEmail, resetToken);

        const resp = await sendMail(confirmedEmail, resetToken);
        res.status(200).json({ success: resp }); return;

    } catch (err) {
        res.status(500).json({ error: err }); return;
    }
});

router.get('/password-reset/:email/:resetToken', async (req: Request, res: Response, next: NextFunction) => {
    const { email, resetToken } = req.params;

    try {
        // Verify that param token is valid
        await auth_functions.verifyResetToken(resetToken);
        const user: User = await auth_functions.getUserForEmail(email);

        // Check if tokens match
        const savedResetToken = await auth_functions.getPasswordResetToken(user.email);
        if (resetToken != savedResetToken) { throw Error('Reset tokens do not match.' )};

        res.render('password_reset', { email: user.email }); return;
    } catch (err) {
        res.render('password_reset', { email: 'FAILED' }); return;
    }
});

router.post('/password-reset/:email/:resetToken', async (req: Request, res: Response, next: NextFunction) => {
    const { email, resetToken } = req.params;
    const { password, confirmPassword }: { password: string, confirmPassword: string } = req.body;

    if (!password || !confirmPassword) {
        res.send(`<script>alert("Blank password field(s)");window.location.href = "/auth/password_reset/${email}/${resetToken}"; </script>`);
        return;
    }

    if (password != confirmPassword) {
        res.send(`<script>alert("Passwords do not match");window.location.href = "/auth/password_reset/${email}/${resetToken}"; </script>`);
        return;
    }

    try {
        // Re-check token & email
        await auth_functions.verifyResetToken(resetToken);
        const user: User = await auth_functions.getUserForEmail(email);
        const savedResetToken = await auth_functions.getPasswordResetToken(email);

        if (resetToken != savedResetToken) { throw Error("Reset token does not match."); return; }

        // Hash and save password
        const hashedPassword = await hashing_helper.hashAndReturnPassword(password);
        await auth_functions.saveNewPassword(hashedPassword, user.email);

        // Todo - Delete MySQL PasswordReset Row

        res.status(200).json( { success: `Successfully saved new password for ${email}` }); return;

    } catch (err) {
        res.status(500).json({ error: err }); return;
    }
});

module.exports = router;