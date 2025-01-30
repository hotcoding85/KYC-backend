import { forwardRef, Inject, Injectable, Req } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Session } from './entities/session.entity';
import { User } from '../user/entities/user.entity';
import { UserService } from '../user/user.service';
import { Request } from 'express';
import { UpdateSessionDto } from './dto/update-session.dto';

@Injectable()
export class SessionService {
  constructor(
    @InjectRepository(Session)
    private readonly sessionRepository: Repository<Session>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @Inject(forwardRef(() => UserService))
    private userService: UserService,
  ) {}

  async createSession(sessionData: Partial<Session>): Promise<Session> {
    const session = this.sessionRepository.create(sessionData);
    try {
      return await this.sessionRepository.save(session);
    } catch (error) {
      console.log(error);
    }
  }

  async getActiveSessions(user_id: string): Promise<Session[]> {
    return await this.sessionRepository.find({ where: { user: { user_id } } });
  }

  async isSessionValid(
    userId: number,
    token: string,
    @Req() req: Request,
  ): Promise<boolean> {
    const ipAddress = req.headers['x-forwarded-for']
      ? req.headers['x-forwarded-for'][0]
      : '127.0.0.1';
    //const thisUser = await this.userService.findOne(userId);
    const session = await this.sessionRepository.findOne({
      where: {
        token: token,
        // ip: ipAddress,
        user: { id: userId },
        isRevoked: false,
      },
      relations: ['user'],
    });

    if (!session) {
      return false;
    }
    // Check if the token has expired
    if (session.expires < new Date()) {
      return false;
    }
    
    return true;
  }

  async getSession(
    userId: number,
    token: string,
    @Req() req: Request,
  ): Promise<Session> {
    const ipAddress = req.headers['x-forwarded-for']
      ? req.headers['x-forwarded-for'][0]
      : '127.0.0.1';
    const thisUser = await this.userService.findOne(userId);

    const session = await this.sessionRepository.findOne({
      where: {
        token: token,
        // ip: ipAddress,
        user: { user_id: thisUser.user_id },
        isRevoked: false,
      },
      relations: ['user'],
    });

    return session;
  }

  async getSessionByOTPToken(userId: number, token: string): Promise<Session> {
    const thisUser = await this.userService.findOne(userId);
    const session = await this.sessionRepository.findOne({
      where: {
        otp_token: token,
        // ip: ipAddress,
        user: { user_id: thisUser.user_id },
        isRevoked: false,
      },
      relations: ['user'],
    });

    return session;
  }

  async updateSession(
    session: Session,
    updateSessionDto: UpdateSessionDto,
  ): Promise<void> {
    try {
      Object.assign(session, updateSessionDto);
      await this.sessionRepository.save(session);
    } catch (error) {
      throw new Error(`Failed to update session: ${error.message}`);
    }
  }

  async removeSession(sessionId: number): Promise<void> {
    try {      
      await this.sessionRepository.delete(sessionId);
    } catch (error) {
      throw new Error(`Failed to update session: ${error.message}`);
    }
  }

  async invalidateSession(userId: string, token: string): Promise<void> {
    try {
      await this.sessionRepository.update(
        { token, user: { user_id: userId } },
        { isRevoked: true },
      );
    } catch (error) {
      console.log(error);
    }
  }

  async invalidateAllSessions(userId: number): Promise<void> {
    await this.sessionRepository.update(
      { user: { id: userId } },
      { isRevoked: true },
    );
  }

  async expireSession(sessionId: number): Promise<void> {
    await this.sessionRepository.update(sessionId, { expires: new Date() });
  }

  async updateLastActive(user_id: string): Promise<void> {
    await this.sessionRepository.update(
      { user: { user_id }, expires: null },
      { created: new Date() },
    );
  }
}
