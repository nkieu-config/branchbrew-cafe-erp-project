import {
  Controller,
  Post,
  Get,
  Body,
  HttpCode,
  HttpStatus,
  Res,
  Req,
} from '@nestjs/common';
import type { Response } from 'express';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { Public } from './public.decorator';
import { setAuthCookie, clearAuthCookie } from './auth-cookie.util';
import type { RequestWithUser } from './interfaces/request-with-user.interface';
import {
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ApiAuthErrorResponses } from '../common/http/swagger-error.decorators';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('login')
  @ApiOperation({ summary: 'Login and set auth cookie' })
  @ApiOkResponse({ description: 'Login successful' })
  @ApiAuthErrorResponses()
  async login(
    @Body() signInDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.login(
      signInDto.email,
      signInDto.password,
    );
    setAuthCookie(res, result.accessToken);
    return { user: result.user };
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Clear auth cookie' })
  @ApiNoContentResponse({ description: 'Logout successful' })
  @ApiAuthErrorResponses()
  logout(@Res({ passthrough: true }) res: Response) {
    clearAuthCookie(res);
  }

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiOkResponse({ description: 'Authenticated profile' })
  @ApiAuthErrorResponses()
  getMe(@Req() req: RequestWithUser) {
    return this.authService.getProfile(req.user.userId);
  }
}
