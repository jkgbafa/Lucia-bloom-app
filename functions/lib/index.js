"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.bloomDailyNotifications = void 0;
const functions = __importStar(require("firebase-functions/v1"));
const admin = __importStar(require("firebase-admin"));
admin.initializeApp();
exports.bloomDailyNotifications = functions.pubsub.schedule("0 12 * * *").onRun(async (context) => {
    const usersSnapshot = await admin.firestore().collection("users").get();
    let messagesSent = 0;
    for (const doc of usersSnapshot.docs) {
        const userData = doc.data();
        // Only process if they have notifications enabled and have an FCM token
        if (!userData.notificationsEnabled || !userData.fcmToken)
            continue;
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
            }
            catch (error) {
                console.error(`Error sending message to ${userData.email}:`, error);
            }
        }
    }
    console.log(`Successfully sent ${messagesSent} scheduled notifications.`);
});
//# sourceMappingURL=index.js.map