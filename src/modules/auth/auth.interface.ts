const User_Role = {
    CONTRIBUTOR: "contributor",
    MAINTAINER: "maintainer",
} as const;

type UserRole = (typeof User_Role)[keyof typeof User_Role];
export interface IUser { 
    name: string;
    email: string;
    password: string;
    role?: UserRole;
}