import { NextFunction, Request, Response} from "express";
import { body, validationResult, ValidationChain } from "express-validator";

const emailValidations = (): ValidationChain => {
    return body('email')
        .exists()
        .withMessage('You must provide an email.')
        .isEmail()
        .normalizeEmail()
        .withMessage('The email provided is invalid.');
}

const usernameValidations = (): ValidationChain => {
    return body('username')
        .exists()
        .withMessage('You must provide a username.')
        .matches(/^(?!.*[-_.]{2})[A-Za-z0-9._-]+$/)
        .withMessage('Usernames may only be alphanumeric characters or non consecutive periods, dashes and underscores.')
        .isLength({ min: 4})
        .withMessage('Username must be at least 4 chars long.')
        .isLength({ max: 24})
        .withMessage('Username must be at most 24 chars long.')
        .trim()
        .escape();
}

const passwordValidations = (): ValidationChain => {
    return body('password')
        .exists()
        .withMessage("You must provide a password.")
        .isLength({ min: 6 })
        .withMessage('The password must be at least 5 characters.')
        .isLength({ max: 32 })
        .withMessage('The password may not exceed 32 characters')
        .matches(/\d/)
        .withMessage('Your password must contain a number.')
        .matches(/[^A-Za-z0-9]/)
        .withMessage('Your password must contain a special character.')
        .matches(/[A-Z]/)
        .withMessage('Your password must contain an uppercase character.')
        .matches(/[a-z]/)
        .withMessage('Your password must contain an lower character.');
}

const validateUserFields = async (req: Request, res: Response, next: NextFunction) => {
    const validations: ValidationChain[] = [
        emailValidations(),
        usernameValidations(),
        passwordValidations()
    ]

    for (let validation of validations) {
        const result = await validation.run(req);
        // @ts-ignore
        if (result.errors.length) break;
    }

    const errors = validationResult(req);
    if (errors.isEmpty()) {
        return next();
    }

    res.status(500).json({ error: errors.array()[0].msg });
};

module.exports = {
    validateUserFields: validateUserFields
}













