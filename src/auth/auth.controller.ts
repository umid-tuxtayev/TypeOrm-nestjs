import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, Res, Req } from '@nestjs/common';
import type { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { CreateAuthDto, LoginAuthDto, ResendOtpAuthDto, VerifyAuthDto } from './dto/create-auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }
  @HttpCode(201)
  @Post('register')
  register(@Body() CreateAuthDto: CreateAuthDto) {
    return this.authService.register(CreateAuthDto)
  }

  @HttpCode(200)
  @Post('login')
  async login(@Body() LoginAuthDto: LoginAuthDto, @Res({ passthrough: true }) res: Response) {
    const { accessToken, refreshToken } = await this.authService.userLogin(LoginAuthDto);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: false,        // localhost
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return { accessToken };
  }

  @HttpCode(200)
  @Post('verify')
  async verify(@Body() VerifyAuthDto: VerifyAuthDto) {
    return this.authService.verifyEmail(VerifyAuthDto.email, VerifyAuthDto.otp)
  }

  @HttpCode(200)
  @Post('resend-otp')
  async resendOtp(@Body() ResendOtpAuthDto: ResendOtpAuthDto) {
    return this.authService.otpRend(ResendOtpAuthDto.email)
  }

  @HttpCode(200)
  @Post('refresh')
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies['refreshToken'];

    if (!refreshToken) throw new Error('No refresh token provided');

    const tokens = await this.authService.refreshToken(refreshToken);

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return { accessToken: tokens.accessToken };
  }
}
