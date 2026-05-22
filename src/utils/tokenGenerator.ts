import jwt from "jsonwebtoken";
import config from "../config";
import type { JwtPayloadObject } from "../types";


const tokenGenerator = (jwtPayload: JwtPayloadObject) => {
    const accessToken = jwt.sign(jwtPayload as object, config.secret as string, {
        expiresIn: "1d",
    });

    const refreshToken = jwt.sign(jwtPayload as object, config.refresh_secrect as string, {
        expiresIn: "7d",
    });

    return { accessToken, refreshToken };
};

export default tokenGenerator;