import { Request, Response, NextFunction } from 'express';
const bcrypt = require('bcrypt');

const hashPassword = async (req: Request, res: Response, next: NextFunction) => {
    const { password }: { password: string} = req.body;
    const salt: string = await bcrypt.genSalt(12);
    const hashedPassword: string = await bcrypt.hash(password, salt);
    req.body.password = hashedPassword;
    next();
};

const hashAndReturnPassword = async (password: string): Promise<string> => {
    return new Promise<string>((async (resolve, reject) => {
        try {
            const salt: string = await bcrypt.genSalt(12);
            const hashedPass: string = await  bcrypt.hash(password, salt);
            resolve(hashedPass);
        } catch (err) {
            reject(err); return;
        }
    }));
}

const compareHash = async (dbHashedPassword: string, clearPassword: string): Promise<null> => {
    return new Promise<null>((async (resolve, reject) => {
        const passwordResp: Error | boolean = await bcrypt.compare(clearPassword, dbHashedPassword);

        if (typeof passwordResp !== 'boolean') {
            reject('Unknown error with password'); return;
        }

        if (passwordResp == false) {
            reject('Incorrect password.'); return;
        }

        resolve(null);
    }));
};

module.exports = {
    hashPassword: hashPassword,
    hashAndReturnPassword: hashAndReturnPassword,
    compareHash: compareHash,
}