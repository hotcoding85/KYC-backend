// firebase.service.ts
import * as admin from 'firebase-admin';
import { Injectable } from '@nestjs/common';
import * as path from 'path';
@Injectable()
export class FirebaseService {
  constructor() {
    if (admin.apps.length === 0) {
        const serviceAccount = require(path.resolve(__dirname, '../../../../src/config/thirteenx-69dbc-firebase-adminsdk-c44dh-10e6dfbf2f.json'));
    
    
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          databaseURL: "https://thirteenx-69dbc-default-rtdb.firebaseio.com/",
        });
    }
  }

  async sendPushNotification(
    registrationToken: string, // The recipient's FCM registration token
    title: string,              // Title of the notification
    body: string                // Body of the notification
  ) {
    if (registrationToken! || registrationToken === '') return
    const message = {
      notification: {
        title: title,
        body: body,
      },
      token: registrationToken, // The device token to send the notification to
    };
    try {
      const response = await admin.messaging().send(message);
      console.log('Successfully sent message:', response);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  }

  async sendNotificationToMultipleTokens(
    tokens: string[],
    title: string,
    body: string,
    userIds: string[],
  ) {
    const validTokens = tokens.filter((token) => typeof token === 'string' && token.trim() !== '');
    
    if (validTokens.length === 0) {
      console.log("No valid tokens provided");
      return { success: false, message: "No valid tokens to send notifications." };
    }
    const message = {
      notification: {
        title,
        body,
      },
      tokens: validTokens,
    };
  
    try {
      // Send notifications via FCM
      const response = await admin.messaging().sendEachForMulticast(message);
      console.log("Successfully sent messages:", response);
  
      // Prepare Firestore message data
      const messageData = {
        title,
        body,
        timestamp: Date.now(),
        isUnread: true,
      };
  
      // Write notifications to Firestore for each user
      const db = admin.firestore();
      const batch = db.batch(); // Use batch for multiple writes
  
      userIds.forEach((userId) => {
        const notificationRef = db.collection('users').doc(userId).collection('notifications').doc();
        batch.set(notificationRef, messageData);
      });
  
      try {
        await batch.commit(); // Commit the batch
        console.log("Notifications stored in Firestore successfully.");
      } catch (firestoreError) {
        console.error("Error storing notifications in Firestore:", firestoreError);
        return {
          success: false,
          message: "Notifications sent, but failed to store in Firestore.",
        };
      }
  
      return {
        success: true,
        message: `Successfully sent ${response.successCount} messages; ${response.failureCount} failed.`,
      };
    } catch (error) {
      console.error("Error sending notifications via FCM:", error);
      return { success: false, message: "Failed to send notifications via FCM." };
    }
  }  

  async getNotifications(userId: string, page: number, pageSize: number | null) {
    const db = admin.firestore();
    try {
      // Reference the user's notifications collection
      const notificationsRef = db
        .collection('users')
        .doc(userId)
        .collection('notifications')
        .orderBy('timestamp', 'desc'); // Ensure notifications are sorted by timestamp
  
      let query;
      if (pageSize == -1) {
        // Fetch all notifications if pageSize is null
        query = notificationsRef;
      } else {
        // Use pagination: calculate the starting point
        const startIndex = (page) * pageSize;
  
        // Fetch the appropriate documents using limit and offset
        query = notificationsRef.limit(Number(startIndex)).offset(0);
      }
  
      // Fetch the documents
      const snapshot = await query.get();
  
      if (snapshot.empty) {
        console.log('No notifications found for this user.');
        return [];
      }
  
      // Map the results to an array of notification objects
      const notifications = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
  
      return notifications;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw new Error('Could not fetch notifications');
    }
  }
  

  async markNotificationsAsRead(userId: string, notificationIds: any) {
    const db = admin.firestore();
    try {
      // Reference the user's notifications collection
      const notificationsRef = db.collection('users').doc(userId).collection('notifications');
  
      // Update each notification's `isUnread` field to `false`
      const updatePromises = notificationIds.map((id) =>
        notificationsRef.doc(id).update({ isUnread: false })
      );
  
      // Wait for all updates to complete
      return await Promise.all(updatePromises);
  
    } catch (error) {
      console.error('Error marking notifications as read:', error);
      throw new Error('Could not mark notifications as read');
    }
  }

  async remove(userId: string, notificationId: string): Promise<{ success: boolean; message: string }> {
    const db = admin.firestore();
    try {
      // Reference to the specific notification
      const notificationRef = db
        .collection('users')
        .doc(userId)
        .collection('notifications')
        .doc(notificationId);
  
      // Check if the document exists
      const docSnapshot = await notificationRef.get();
      if (!docSnapshot.exists) {
        return {
          success: false,
          message: `Notification with ID ${notificationId} does not exist for user ${userId}.`,
        };
      }
  
      // Delete the notification
      await notificationRef.delete();
  
      return {
        success: true,
        message: `Notification with ID ${notificationId} removed successfully.`,
      };
    } catch (error) {
      console.error('Error removing notification:', error);
      return {
        success: false,
        message: 'Failed to remove notification due to an error.',
      };
    }
  }
}
