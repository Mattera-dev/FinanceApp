export interface IUser { name: string, email: string }

export interface IUserId extends IUser {
    id: string
}

export interface IUserCredentials {
    email: string,
    phone?: string
}