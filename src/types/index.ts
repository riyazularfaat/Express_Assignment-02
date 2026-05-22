export type SendResponse<T> = {
    statusCode: number;
    success: boolean;
    message?: string;
    data?: T;
    error?: unknown;
}

export type UserRole = "contributor" | "maintainer";

export type JwtPayloadObject = {
    id: number;
    name: string;
    role: UserRole;
}
