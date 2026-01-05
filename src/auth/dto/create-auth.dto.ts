import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class CreateAuthDto {
    @IsString()
    @IsNotEmpty()
    username: string
    @IsString()
    @IsEmail()
    email: string
    @IsString()
    @IsNotEmpty()
    password: string
}

export class LoginAuthDto {
    @IsString()
    @IsEmail()
    email: string
    @IsString()
    @IsNotEmpty()
    password: string
}

export class VerifyAuthDto {
    @IsString()
    @IsEmail()
    email: string
    @IsString()
    @IsNotEmpty()
    otp: string
}

export class ResendOtpAuthDto {
    @IsString()
    @IsEmail()
    email: string
}