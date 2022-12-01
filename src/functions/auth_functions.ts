import { User } from "../models/User";
import { MysqlError, OkPacket } from "mysql";
import { Response } from "express";
const connection = require("../helpers/mysql_pools");
const jwt = require('jsonwebtoken');
require('dotenv').config();

const saveUser = async function saveUser(email: string, username: string, password: string): Promise<null> {
    return new Promise<null>((((resolve, reject) => {
        const query = "INSERT INTO Users SET ?";

        const user: User = {
            email: email,
            username: username,
            password: password
        }

        connection.query(query, user, (err: MysqlError | null, result: OkPacket | null) => {
            if (err != null) {
                reject(err.message); return;
            }

            if (result != null) {
                if (result.affectedRows == 1) {
                    resolve(null); return;
                } else {
                    reject('Unknown error 1 saving user to database'); return;
                }

            } else {
                reject('Unknown error 2 saving user to database'); return;
            }
        });
    })));
};

const saveNewPassword = async function saveNewPassword(password: string, email: string): Promise<null> {
    return new Promise<null>((((resolve, reject) => {
        const query = `UPDATE Users SET password=${connection.escape(password)} WHERE email=${connection.escape(email)}`;

        connection.query(query, (err: MysqlError | null, result: OkPacket | null) => {
            if (err != null) {
                reject(err.message); return;
            }

            if (result != null) {
                console.log('result.affectedRows', result.affectedRows)
                if (result.affectedRows == 1) {
                    resolve(null); return;
                } else {
                    reject('Unknown error 1 updating user password in database.'); return;
                }
            } else {
                reject('Unknown error 2 updating user password in database.'); return;
            }
        });
    })));
}

const getUserForEmail = async function getUserForEmail(email: string): Promise<User> {
    return new Promise<User>(((resolve, reject) => {
        const query = "SELECT * FROM Users WHERE email=" + connection.escape(email);

        connection.query(query, async (err: MysqlError | null, result: any) => {
            if (err != null) {
                reject(err.message); return;
            }

            if (result == null || result.length != 1) {
                reject('Incorrect email address.'); return;
            }

            if (result != null && result.length == 1) {
                const user: User = {
                    email: result[0].email,
                    username: result[0].username,
                    password: result[0].password,
                }
                resolve(user); return;
            }
        });
    }));
};

const createAndAddJwtToRes = function createAndAddJwtToRes(email: string, username: string, res: Response) {
    const json = jwt.sign({ email, username }, process.env.JWT_SECRET, { expiresIn: 86400 * 14 } );
    res.cookie('jwt', json, { httpOnly: true, maxAge: 86400 * 14 * 1000 } );
};

const savePasswordResetToken = async function savePasswordResetToken(email: string, token: string): Promise<null> {
    return new Promise<null>(((resolve, reject) => {
        const query = 'INSERT INTO PasswordReset SET ?' + 'ON DUPLICATE KEY UPDATE token=' + connection.escape(token);

        const passwordResetObject = {
            email: email,
            token: token
        }

        connection.query(query, passwordResetObject, (err: MysqlError | null, result: OkPacket | null) => {
            if (err != null) {
                reject(err.message); return;
            }

            if (result != null) {
                if (result.affectedRows == 1 || result.affectedRows == 2) {
                    resolve(null); return;
                } else {
                    reject('Unknown error 1 saving password reset to database'); return;
                }
            } else {
                reject('Unknown error 2 saving password reset to database'); return;
            }
        });
    }));
}

const getPasswordResetToken = async function getPasswordResetToken(email: string): Promise<string> {
    return new Promise<string>(((resolve, reject) => {
        const query = 'SELECT token FROM PasswordReset WHERE email=' + connection.escape(email);

        connection.query(query, (err: MysqlError | null, result: any) => {
            if (err != null) {
                reject(err.message); return;
            }

            if (result != null && result.length == 1) {
                const token = result[0].token;
                resolve(token); return;
            } else {
                reject('Unknown error 1 getting reset token from database.'); return;
            }
        });
    }));
}

const verifyResetToken = async function verifyResetToken(token: string): Promise<null> {
    return new Promise<null>(((resolve, reject) => {
        jwt.verify(token, process.env.JWT_SECRET, async (err: any, decodedToken: any) => {
            if (err) {
                reject(`Incorrect reset token: ${err}`); return;
            }

            if (decodedToken) {
                resolve(null); return;
            } else {
                reject('Unknown error with token.'); return;
            }
        });
    }));
}

module.exports = {
    saveUser: saveUser,
    saveNewPassword: saveNewPassword,
    getUserForEmail: getUserForEmail,
    createAndAddJwtToRes: createAndAddJwtToRes,
    savePasswordResetToken: savePasswordResetToken,
    getPasswordResetToken: getPasswordResetToken,
    verifyResetToken: verifyResetToken,
};