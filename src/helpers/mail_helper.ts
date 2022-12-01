import nodemailer, { SentMessageInfo } from "nodemailer";
require('dotenv').config();

const transporter = nodemailer.createTransport({
   host: process.env.HOST,
    // @ts-ignore
   port: (process.env.SMTP_PORT as number),
    // @ts-ignore
    secure: process.env.SECURE as boolean,
    auth: {
       user: process.env.AUTH_USER,
       pass:  process.env.AUTH_PASS
    }
});

export const sendMail = async (toEmail: string, token: string): Promise<string> => {
    return new Promise<string>(async (resolve, reject) => {
        try {
            const sentMailResp: SentMessageInfo = await transporter.sendMail({
                from: process.env.FROM_EMAIL,
                to: toEmail,
                subject: 'Password Reset Link',
                text: `Your password reset link:\n ${process.env.DOMAIN_NAME+'auth/password-reset/'+toEmail+'/'+token}`,
            });

            if (sentMailResp.accepted.length > 0) {
                resolve('Email successfully sent.')
            } else {
                reject('Unknown SMTP server error: Contact system administrator.');
            }

        } catch (err: any) {
            reject('SMTP Error' + err + ': Contact system administrator.')
        }
    });
}