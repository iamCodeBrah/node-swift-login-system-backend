import express, { Application, Router, Request, Response, NextFunction } from 'express';
const app: Application = express();
const cookieParser = require('cookie-parser');
   
app.use(express.json());
app.use(cookieParser());

app.get('/', (req: Request, res: Response, next: NextFunction) => {
   res.status(200).json({ success: 'Hello Server'});
});

module.exports = app;