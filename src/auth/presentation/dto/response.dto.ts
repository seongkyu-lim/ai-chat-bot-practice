import { IsNotEmpty, IsString } from 'class-validator';

export class AccountLoginResDto {
  @IsString()
  @IsNotEmpty()
  accessToken: string;

  @IsString()
  @IsNotEmpty()
  refreshToken: string;

  static of(accessToken: string, refreshToken: string) {
    const accountLoginResDto = new AccountLoginResDto();
    accountLoginResDto.accessToken = accessToken;
    accountLoginResDto.refreshToken = refreshToken;
    return accountLoginResDto;
  }
}
