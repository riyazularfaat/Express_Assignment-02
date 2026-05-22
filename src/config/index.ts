import dotenv from "dotenv";
import path from "path";
import { env} from "process";

dotenv.config();


const config = {
    connection_string: env.CONNECTION_STRING as string,
    port: env.PORT || 3000,
    secret: env.JWT_SECRET as string,
    refresh_secrect: env.REFRESH_SECRET as string
}

export default config;