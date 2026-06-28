import { body } from "express-validator";

const registerUserValidator = () => {
  return [
    body("email")
      .trim()
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Email is invalid"),
    body("username")
      .trim()
      .notEmpty()
      .withMessage("Username is required")
      .isLength({ min: 8 })
      .withMessage("Username should be atleast 8 Character"),
    body("password")
      .trim()
      .notEmpty()
      .withMessage("Password is required")
      .isLength({ min: 8 })
      .withMessage("Password should be atleast 8 Character")
      .matches(
        /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>_\-+=/\\[\];'`~]).+$/,
      )
      .withMessage(
        "Password must contain at least one uppercase letter, one number, and one special character",
      ),
  ];
};


const loginUserValidator = () => {
  return [
    body("email")
      .trim()
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Email is invalid"),
    body("password")
      .trim()
      .notEmpty()
      .withMessage("Password is required")
      .isLength({ min: 8 })
      .withMessage("Password should be atleast 8 Character")
      .matches(
        /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>_\-+=/\\[\];'`~]).+$/,
      )
      .withMessage(
        "Password must contain at least one uppercase letter, one number, and one special character",
      ),
  ];
};

export {
    registerUserValidator,
    loginUserValidator
}
