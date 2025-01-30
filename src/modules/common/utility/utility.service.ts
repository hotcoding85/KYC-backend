import {
  Injectable,
  HttpException,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as AWS from 'aws-sdk';
import { randomBytes } from 'crypto';
import axios from 'axios';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
@Injectable()
export class UtilityService {
  private s3: AWS.S3;

  constructor(private readonly configService: ConfigService) {
    this.s3 = new AWS.S3({
      accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID'),
      secretAccessKey: this.configService.get<string>('AWS_SECRET_ACCESS_KEY'),
      region: this.configService.get<string>('AWS_REGION'),
    });
  }

  async uploadToS3(
    bucket: string,
    key: string,
    body: Buffer | string,
  ): Promise<AWS.S3.ManagedUpload.SendData> {
    const params = {
      Bucket: bucket,
      Key: key,
      Body: body,
    };

    return this.s3.upload(params).promise();
  }

  generateSecureOtp(): string {
    const buffer = randomBytes(3);
    const otp = parseInt(buffer.toString('hex'), 16) % 1000000;
    return otp.toString().padStart(6, '0');
  }

  async deleteImageByUrl(imageUrl: string): Promise<void> {
    try {
      const { bucket, key } = this.parseS3Url(imageUrl);

      const params = {
        Bucket: bucket,
        Key: key,
      };

      await this.s3.deleteObject(params).promise();
    } catch (error) {
      throw new Error(`Failed to delete image: ${error.message}`);
    }
  }

  private parseS3Url(url: string): { bucket: string; key: string } {
    const parsedUrl = new URL(url);
    const bucket = parsedUrl.hostname.split('.')[0];
    const key = parsedUrl.pathname.slice(1);

    return { bucket, key };
  }

  async eventAPI(
    url: string,
    param: object,
    method: 'POST' | 'GET',
    header?: object,
  ): Promise<any> {
    try {
      let response;
      const headerObj = header
        ? {
            headers: {
              ...header,
            },
          }
        : {
            headers: {
              'Content-Type': 'application/json',
            },
          };
      if (method === 'POST') {
        response = await axios.post(url, param, headerObj);
      } else if (method === 'GET') {
        response = await axios.get(url, {
          params: param,
          headers: {
            'Content-Type': 'application/json',
            ...(header || {}),
          },
        });
      }

      return response.data;
    } catch (error) {
      console.error(`Error making ${method} request to ${url}:`, error);
      throw new HttpException(
        error.response?.data || 'Error processing request',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async me(req: Request, jwtService: JwtService): Promise<number> {
    try {
      let token: string | undefined;

      if (!req.isApiCall) {
        token = req.cookies?.Refresh;

        if (!token) {
          throw new UnauthorizedException('Refresh token missing');
        }
      } else {
        const authHeader = req.headers['authorization'];
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          throw new UnauthorizedException(
            'Authorization token missing or invalid',
          );
        }
        token = authHeader.split(' ')[1];
      }

      const payload = jwtService.verify(token);
      return payload.sub;
    } catch (error) {
      console.error('Token validation error:', error.message);
      throw new UnauthorizedException('Invalid token or session');
    }
  }

  formatLargeNumber(num: number): string {
  if (num >= 1_000_000_000_000) {
    return (num / 1_000_000_000_000).toFixed(2) + 'T'; // Trillion
  } else if (num >= 1_000_000_000) {
    return (num / 1_000_000_000).toFixed(2) + 'B'; // Billion
  } else if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(2) + 'M'; // Million
  } else if (num >= 1_000) {
    return (num / 1_000).toFixed(2) + 'K'; // Thousand
  } else {
    return num.toString(); // For numbers less than 1,000, no suffix needed
  }
}
}
