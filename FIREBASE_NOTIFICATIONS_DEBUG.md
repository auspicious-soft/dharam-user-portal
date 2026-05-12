# Firebase Push Notifications - Setup & Debugging Guide

## ❌ Issues Fixed

1. **Missing VAPID Key** - Required for FCM token generation
2. **Missing FCM Endpoint** - Where to send the token
3. **Poor Logging** - Added detailed console logs to track the flow
4. **Data-Only Messages** - Service worker now handles messages without `notification` object
5. **Service Worker Improvements** - Better error handling and notification click support

---

## ✅ Required Setup Steps

### 1. Get VAPID Key from Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **`vcareprojectmanagement-51e4b`**
3. Navigate to: **Project Settings** (⚙️ icon) → **Cloud Messaging**
4. Under "Web Push certificates", click **Generate Key Pair** (if not exists)
5. Copy the **public key** (this is your VAPID key)

### 2. Update `.env.local` File

```env
# These are already set from firebase-config.json
VITE_FIREBASE_API_KEY=AIzaSyCwUnMzH7fdvC-6mHfFZfBNeetXVPma39o
VITE_FIREBASE_AUTH_DOMAIN=vcareprojectmanagement-51e4b.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=vcareprojectmanagement-51e4b
VITE_FIREBASE_STORAGE_BUCKET=vcareprojectmanagement-51e4b.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=216495126134
VITE_FIREBASE_APP_ID=1:216495126134:web:1db290ad0d1d76686dd157

# ⚠️ MUST SET: Get from Firebase Console → Project Settings → Cloud Messaging
VITE_FIREBASE_VAPID_KEY=YOUR_PUBLIC_KEY_HERE

# ⚠️ MUST SET: Your backend API endpoint to store FCM tokens
VITE_FCM_TOKEN_ENDPOINT=/api/fcm/token
```

### 3. Ensure Backend Stores FCM Tokens

Your backend should have an endpoint that:

- **POST** to `VITE_FCM_TOKEN_ENDPOINT` with body: `{ token: string, context: "login" | "register" }`
- Store the token associated with the user
- **Important**: Keep tokens for sending notifications later

### 4. Test Flow

The flow happens in this order:

1. ✅ App loads → `App.tsx` calls `setupForegroundNotifications()`
2. ✅ User logs in → `Login.tsx` calls `getFcmToken()` → `sendFcmToken("login")`
3. ✅ Service worker registers → `navigator.serviceWorker.register("/firebase-messaging-sw.js")`
4. ✅ FCM token generated → Sent to your backend
5. ✅ Notifications received → Displayed via service worker

---

## 🔍 Debugging Checklist

### Browser Console Logs to Look For

When everything works correctly, you should see:

```
🔐 Requesting notification permission...
Permission result: granted
📝 Registering service worker...
✅ Service worker registered: [ServiceWorkerRegistration object]
🎫 Requesting FCM token...
✅ FCM Token obtained: ABcd...
📤 Getting FCM token for context: login
📡 Sending FCM token to backend...
✅ FCM token sent successfully. Response: [response data]
📬 Foreground notification received: [payload]
```

### Common Issues & Fixes

#### ❌ "Missing VITE_FIREBASE_VAPID_KEY"

- **Problem**: VAPID key not set in `.env.local`
- **Fix**: Get the public key from Firebase Console (see Step 1 above)

#### ❌ "Notification permission denied"

- **Problem**: User rejected notification permission
- **Fix**:
  - Check browser settings: Site Settings → Notifications
  - Allow notifications for this site
  - Clear site data and reload

#### ❌ "Service Workers not supported"

- **Problem**: Browser doesn't support Service Workers
- **Fix**:
  - Use Chrome, Firefox, Edge, or Safari (latest versions)
  - Ensure site is served over HTTPS (not HTTP)

#### ❌ "Firebase Messaging not supported"

- **Problem**: Browser doesn't support FCM
- **Fix**: Same as above - update browser or use HTTPS

#### ❌ Service Worker not registering

- **Problem**: `/firebase-messaging-sw.js` file not found or has syntax errors
- **Fix**:
  - Check file exists at `public/firebase-messaging-sw.js`
  - Check browser console for 404 or parsing errors
  - Test: Open `http://localhost:5173/firebase-messaging-sw.js` in browser

#### ❌ Notifications not showing (background)

- **Problem**: App is in background but no notification appears
- **Fix**:
  - Ensure token is stored in your backend
  - When sending from Firebase Console, target this device's token
  - Check service worker logs: Go to DevTools → Application → Service Workers → "inspect"

#### ❌ Notifications not showing (foreground)

- **Problem**: App is open but notification doesn't appear
- **Fix**: Foreground notifications require explicit handling (already in `setupForegroundNotifications()`)

---

## 📤 Sending Test Notifications

### From Firebase Console

1. Go to Firebase Console → Messaging
2. Create a new campaign
3. Write notification title & body
4. Select "Send test message"
5. Add your device token
6. Send

### From Your Backend

Send POST request to Firebase:

```bash
curl -X POST https://fcm.googleapis.com/v1/projects/vcareprojectmanagement-51e4b/messages:send \
  -H "Authorization: Bearer {ACCESS_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "message": {
      "token": "{FCM_TOKEN}",
      "notification": {
        "title": "Test Title",
        "body": "Test Body"
      },
      "data": {
        "clickUrl": "/dashboard"
      }
    }
  }'
```

---

## 📝 File Changes Made

1. ✅ **`.env.local`** - Created with environment variables (incomplete VAPID key)
2. ✅ **`src/lib/fcm.ts`** - Added detailed logging and data-only message support
3. ✅ **`public/firebase-messaging-sw.js`** - Added data-only message handling, click handler, and logging

---

## 🚀 Next Steps

1. Get VAPID key from Firebase Console
2. Update `.env.local` with VAPID key
3. Restart dev server (`npm run dev`)
4. Check browser console for logs
5. Test sending notification from Firebase Console
6. Verify notification appears on device

---

## 📞 Support Commands

**Check if service worker is registered:**

```javascript
// Run in browser console
navigator.serviceWorker.getRegistrations().then((regs) => console.log(regs));
```

**Check notification permission:**

```javascript
console.log(Notification.permission); // "granted", "denied", or "default"
```

**Check stored FCM token (if you have access to backend):**

```
GET /api/fcm/token?userId={user_id}
```
