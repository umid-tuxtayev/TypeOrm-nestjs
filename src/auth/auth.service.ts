import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateAuthDto, LoginAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Auth } from './entities/auth.entity';
import { MailService } from './mail/mail.service';
import bcrypt from "bcrypt"
import { JwtService } from '@nestjs/jwt';
import { addAbortListener } from 'events';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Auth) private readonly authModel: Repository<Auth>,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService
  ) { }
  async register(CreateAuthDto: CreateAuthDto) {
    let findUser = await this.authModel.findOne({ where: { email: CreateAuthDto.email } })
    if (findUser) throw new BadRequestException('user already registerid')
    let hashPasswor = await bcrypt.hash(CreateAuthDto.password, 10)
    let otp = String(Math.floor(100000 + Math.random() * 900000));
    let otpTime = Date.now() + 1000 * 60 * 2;
    await this.mailService.sendOtp(CreateAuthDto.email, otp);
    const userData = { ...CreateAuthDto, otp, otpTime, password: hashPasswor }
    let createUser = await this.authModel.create(userData)
    await this.authModel.save(createUser)
    return { message: 'user register successfully', statsu: 201 }
  }

  async userLogin(LoginAuthDto: LoginAuthDto) {
    let findUser = await this.authModel.findOne({ where: { email: LoginAuthDto.email } })
    if (!findUser) throw new BadRequestException('user not found')
    let passwordCheck = await bcrypt.compare(LoginAuthDto.password, findUser.password)
    if (!passwordCheck) throw new NotFoundException('User not found !');
    if (findUser.isVerified === false) throw new ForbiddenException('Login qilishdan avval accountni tastiqlang');

    const accessToken = this.jwtService.sign(
      { id: findUser.id },
      { expiresIn: '1m' },
    );

    const refreshToken = this.jwtService.sign(
      { id: findUser.id },
      { expiresIn: '7d' },
    );

    findUser.refreshToken = refreshToken
    await this.authModel.save(findUser)
    return { accessToken, refreshToken };
  }

  async verifyEmail(email, otp) {
    let user = await this.authModel.findOne({ where: { email } });
    let currentTime = Date.now();
    if (!user) throw new NotFoundException('User not found !');
    if (Number(user.otpTime) < currentTime) {
      await this.authModel.update({ email }, { otp: null, otpTime: null })
      throw new BadRequestException('OTP expired')
    }
    if (otp != user.otp) throw new BadRequestException('Invalid otp !')
    user.otp = null;
    user.isVerified = true;
    await this.authModel.save(user);
    return { message: 'Verify account succcessfully', status: 200 }
  }

  async otpRend(email: string) {
    let user = await this.authModel.findOne({ where: { email } });
    if (!user) throw new NotFoundException('User not found !');
    let otp = String(Math.floor(100000 + Math.random() * 900000));
    let otpTime = Date.now() + 1000 * 60 * 2;
    user.otp = otp;
    user.isVerified = false;
    user.otpTime = otpTime;
    await this.authModel.save(user);
    await this.mailService.sendOtp(email, otp);
    return { message: 'Resend otp successfully', status: 200 };
  }

  async refreshToken(token: string) {
    try {
      const payload = this.jwtService.verify(token, { secret: process.env.JWT_REFRESH_SECRET });

      const user = await this.authModel.findOne({ where: { id: payload.id } });
      if (!user || user.refreshToken !== token) throw new Error('Invalid refresh token');

      const newAccessToken = this.jwtService.sign(
        { id: user.id },
        { secret: process.env.JWT_ACCESS_SECRET, expiresIn: '15m' },
      );

      const newRefreshToken = this.jwtService.sign(
        { id: user.id },
        { secret: process.env.JWT_REFRESH_SECRET, expiresIn: '7d' },
      );

      user.refreshToken = newRefreshToken;
      await this.authModel.save(user);

      return { accessToken: newAccessToken, refreshToken: newRefreshToken };
    } catch (err) {
      throw new Error('Invalid or expired refresh token');
    }
  }
}
