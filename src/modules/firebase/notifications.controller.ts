// notifications.controller.ts
import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { FirebaseService } from './firebase.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('notifications')
export class NotificationsController {
    constructor(private firebaseService: FirebaseService) {}

    @UseGuards(JwtAuthGuard) // Protect the route
    @Post('send-notification')
    async sendNotification(@Body() body: { token: string; title: string; message: string }) {
        const { token, title, message } = body;

        await this.firebaseService.sendPushNotification(token, title, message);
        return { message: 'Notification sent' };
    }

    @Post("send-multiple-notifications")
    async sendMultipleNotifications(@Body() body: {tokens: string[], title: string, body: string, icon: string}) {
        return this.firebaseService.sendNotificationToMultipleTokens(
            body.tokens,
            body.title,
            body.body,
            [],
        );
    }
}
