import {
  AccountLoginReqDto,
  AccountRegisterReqDto,
} from '../../presentation/dto/request.dto';
import { AccountLoginResDto } from '../../presentation/dto/response.dto';

export interface AuthUseCase {
  register(requestDto: AccountRegisterReqDto): Promise<string>;
  login(requestDto: AccountLoginReqDto): Promise<AccountLoginResDto>;
}
