import jwt from "jsonwebtoken";

export const generateToken = async (user, secret, expiresIn) => {
    const { id } = user;
    return await jwt.sign({ id }, secret, { expiresIn });
};