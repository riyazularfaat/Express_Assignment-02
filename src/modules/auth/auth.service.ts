import bcrypt from "bcrypt";
import type { IUser } from "./auth.interface";
import { pool } from "../../db";
import tokenGenerator from "../../utils/tokenGenerator";
import config from "../../config";
import jwt, { type JwtPayload } from "jsonwebtoken";


const registeredIntoDB = async (payload: IUser) => { 
    const { name, email, password, role} = payload;
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(`
            INSERT INTO users(name,email,password, role) VALUES($1,$2,$3,COALESCE($4, 'contributor')) RETURNING *
            `,
            [name, email, hashedPassword, role]
    )
    delete result.rows[0].password;
    return result;
}


const loginUserIntoDB = async (payload: { email: string, password: string }) => { 
    const { email, password} = payload;
    const userData = await pool.query(`
        SELECT * FROM users WHERE email = $1
    `, [email]);

    if (userData.rows.length === 0) { 
        throw new Error("Invalid email!");
    }
    const user = userData.rows[0];

    const matchPassword = await bcrypt.compare(password, user.password);
    
    if (!matchPassword) { 
        throw {
            statusCode: 401,
            message: "Unauthorized",
            errors: "Invalid credentials"
        };
    }

    const jwtPayload = {
        id: user.id,
        name: user.name,
        role: user.role
    }
    const { accessToken, refreshToken } = tokenGenerator(jwtPayload);

    delete user.password;

    return {
        accessToken,
        refreshToken,
        user
    };
}


const generateRefreshToken = async (token: string) => { 
    if (!token) {
        throw {
            statusCode: 401,
            message: "Unauthorized",
            errors: "Refresh token is required"
        };
    }
    const decoded = jwt.verify(token as string, config.refresh_secrect as string) as JwtPayload
    const userData = await pool.query(`SELECT * FROM users WHERE id=$1`, [decoded.id])
    if (userData.rows.length === 0) {
        throw {
            statusCode: 404,
            message: "Not Found",
            errors: "User not found"
        };
    }
    const user = userData.rows[0]

    const jwtPayload = {
        id: user.id,
        name: user.name,
        role: user.role
    }
    return tokenGenerator(jwtPayload);
}

export const authService = {
    registeredIntoDB,
    loginUserIntoDB,
    generateRefreshToken,
}
