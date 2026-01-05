import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { Auth } from './auth/entities/auth.entity';
import { ProductsModule } from './products/products.module';
import { Product } from './products/entities/product.entity';


@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath: '.env', isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      database: process.env.DB_NAME,
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      password: process.env.DB_PASS,
      username: process.env.DB_USER,
      synchronize: true,
      logging: false,
      entities: [Auth, Product]
    }),
    AuthModule,
    ProductsModule
  ],
})
export class AppModule { }
