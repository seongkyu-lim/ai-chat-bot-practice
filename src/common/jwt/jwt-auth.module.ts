import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './jwt.constants';
import { Module } from '@nestjs/common';

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '1d' },
    }),
  ],
})
export class JwtAuthModule {}
