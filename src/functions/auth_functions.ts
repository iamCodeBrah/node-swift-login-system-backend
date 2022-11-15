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
}

const createAndAddJwtToRes = function createAndAddJwtToRes(email: string, username: string, res: Response) {
    const json = jwt.sign({ email, username }, process.env.JWT_SECRET, { expiresIn: 86400 * 14 } );
    res.cookie('jwt', json, { httpOnly: true, maxAge: 86400 * 14 * 1000 } );
}



module.exports = {
    saveUser: saveUser,
    createAndAddJwtToRes: createAndAddJwtToRes,
};