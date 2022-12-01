import express, { Request, Response, NextFunction, Router } from "express";
const router: Router = express.Router();
const data_functions = require('../functions/data_functions');

router.post('/set-data', async (req: Request, res: Response, next: NextFunction) => {
    const data: string = req.body.data;
    const email: string | undefined = req.app.locals.user.email;

    if (typeof  data !== 'string') {
        res.status(500).json({ error: 'The data must be a string.' }); return;
    }

    if (email === undefined) {
        res.status(500).json({ error: 'You must sign in to do that' }); return;
    }

    try {
        await data_functions.saveData(email, data);
        res.status(200).json({ success: 'The data was submitted.' });
    } catch (err) {
        res.status(500).json({ error: err }); return;
    }
});

router.get('/get-data', async (req: Request, res: Response, next: NextFunction) => {
    const email: string | undefined = req.app.locals.user.email;

    if (email === undefined) {
        res.status(500).json({ error: 'You must sign in to do that' }); return;
    }

    try {
        const dataArray = await data_functions.getData(email);
        res.status(200).json({ data: dataArray });
    } catch (err) {
        res.status(500).json({ error: err }); return;
    }
});

module.exports = router;