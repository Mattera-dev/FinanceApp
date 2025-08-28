export interface IUserRegisterRequest {
    name: string,
    email: string,
    phone: string,
    password: string
}

export interface IUserLoginRequest {
    email: string,
    password: string
}