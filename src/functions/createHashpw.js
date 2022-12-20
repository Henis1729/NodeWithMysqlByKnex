import bcrypt from "bcryptjs";
let salt = bcrypt.genSaltSync(10);

export const convertHash = (password) => {
    return bcrypt.hashSync(password, salt);
}

export const verifyPassword = (inputPassword, dbPassword) => {
    return !!bcrypt.compareSync(inputPassword, dbPassword);
}

