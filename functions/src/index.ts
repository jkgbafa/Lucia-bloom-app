import * as functions from "firebase-functions/v1";
import * as admin from "firebase-admin";

admin.initializeApp();

export const bloomDailyNotifications = functions.pubsub.schedule("0 12 * * *").onRun(async (context) => {
  const usersSnapshot = await admin.firestore().collection("users").get();
  
  let messagesSent = 0;

  for (const doc of usersSnapshot.docs) {
    const userData = doc.data();
    
    // Only process if they have notifications enabled and have an FCM token
    if (!userData.notificationsEnabled || !userData.fcmToken) continue;
    
    // Check if we need to send a log reminder
    if (userData.notifyLogReminder) {
      const message = {
        notification: {
          title: "🌸 Time for your daily check-in!",
          body: "How are you feeling today, Lucia? Take a moment to log your symptoms.",
        },
        token: userData.fcmToken,
      };
      
      try {
        await admin.messaging().send(message);
        messagesSent++;
      } catch (error) {
        console.error(`Error sending message to ${userData.email}:`, error);
      }
    }
  }

  console.log(`Successfully sent ${messagesSent} scheduled notifications.`);
});
