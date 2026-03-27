# 🔴 Error 400: origin_mismatch - Quick Fix Guide

## What is the Origin Mismatch Error?

When you try to sign in with Google, you see:
```
Error 400: origin_mismatch
The origin does not match
```

This happens because your app's location (origin) isn't registered in Google Cloud Console.

---

## Quick Fix (2 Steps)

### Step 1: Find Your Current App Origin

**When running locally:**
- Open browser DevTools (Press `F12`)
- Go to **Console** tab
- Look for this message:
  ```
  📍 App Origin: http://localhost:8000
  📍 App Host: localhost:8000
  📍 App Protocol: http:
  ```
  (Your actual URL might be different)

- Or check the browser address bar for the URL

**Common app origins:**
- `http://localhost` (running on local server)
- `http://localhost:3000` (common dev port)
- `http://localhost:8000` (common dev port)
- `http://127.0.0.1` (localhost IP)
- `file://` (opening HTML file directly)
- `https://yourdomain.com` (production domain)

---

### Step 2: Add Origin to Google Console

**Follow these steps exactly:**

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/
   - Sign in with your Google account

2. **Select Your BillPro Project**
   - If you don't see it, create one first

3. **Navigate to Credentials**
   - In left sidebar, click `APIs & Services`
   - Click `Credentials`

4. **Edit Your OAuth 2.0 Client ID**
   - Find your "BillPro" OAuth 2.0 Client ID
   - Click on it to edit
   - Look for section: **Authorized JavaScript origins**

5. **Add Your Origin**
   - Click `+ ADD URI`
   - Paste your origin from Step 1
   - Examples:
     ```
     http://localhost:8000
     http://localhost:3000
     http://127.0.0.1
     file://
     ```

6. **Save Changes**
   - Click `SAVE` button
   - Wait for the changes to apply (5-10 seconds)

7. **Refresh Your App**
   - Go back to your billing app
   - Press `Ctrl+F5` (force refresh) or `Ctrl+Shift+Del` (clear cache)
   - Try Google Sign-In again

---

## Add Multiple Origins (Recommended)

If you want to cover all possibilities, add **all these origins**:

```
http://localhost
http://localhost:3000
http://localhost:5000
http://localhost:8000
http://127.0.0.1
http://127.0.0.1:3000
http://127.0.0.1:5000
http://127.0.0.1:8000
file://
```

Then, no matter how you open the app, it will work.

---

## For Production (If You Have a Domain)

If you have a website domain like `mybusiness.com`, also add:

```
https://mybusiness.com
https://www.mybusiness.com
```

---

## Troubleshooting

### Still getting error after adding origin?

1. **Clear Browser Cache**
   - Press `Ctrl+Shift+Del`
   - Clear "All time"
   - Close and reopen browser

2. **Wait 10-15 seconds**
   - Google Console changes take time to propagate
   - Wait before refreshing

3. **Check Exact URL**
   - Make sure the origin in Console matches your URL exactly
   - Example: If you're at `http://localhost:8000`, add exactly that

4. **Check Your Client ID**
   - In [config.js](config.js), verify the `GOOGLE_CLIENT_ID` matches:
     - Go to Console
     - APIs & Services → Credentials
     - Copy the exact Client ID
     - Paste in config.js

### Can't find the OAuth Client ID?

1. Go to https://console.cloud.google.com/
2. Select your project
3. APIs & Services → Credentials
4. Look for "OAuth 2.0 Client IDs" section
5. Should see your "BillPro" or "Web client" entry

### Don't have a project yet?

1. Go to https://console.cloud.google.com/
2. Click "Create Project"
3. Name it "BillPro"
4. Wait for it to be created
5. Enable Google+ API (APIs & Services → Enable APIs)
6. Create OAuth 2.0 credentials (Credentials → Create Credentials)
7. Select "Web application"
8. Add origins (see Step 2 above)
9. Copy Client ID to [config.js](config.js)

---

## Using Demo Login (Temporary Solution)

While configuring Google, you can use:

✅ **Demo Login Button**
- Click "Demo Login" on the login screen
- No Google setup needed
- Fully functional for testing
- Doesn't require internet for OAuth

---

## Check Browser Console for Details

When having issues, always check:

1. Press `F12` to open DevTools
2. Go to `Console` tab
3. Look for messages like:
   ```
   📍 App Origin: http://localhost:8000
   ✅ Google Sign-In initialized successfully
   ❌ Error 400: origin_mismatch
   ```

These messages help diagnose the issue.

---

## Need More Help?

1. **Google OAuth Documentation**: https://developers.google.com/identity/gsi/web
2. **Check Console Messages**: Your error message usually hints at the problem
3. **Check Network Tab**: In DevTools → Network, see what requests fail

---

## Summary Checklist

- [ ] Found your app's current origin (F12 → Console)
- [ ] Visited Google Cloud Console (https://console.cloud.google.com/)
- [ ] Selected your BillPro project
- [ ] Went to APIs & Services → Credentials
- [ ] Found and edited OAuth 2.0 Client ID
- [ ] Added your origin to "Authorized JavaScript origins"
- [ ] Clicked Save
- [ ] Waited 10-15 seconds
- [ ] Cleared browser cache (Ctrl+Shift+Del)
- [ ] Refreshed app (Ctrl+F5)
- [ ] Tried Google Sign-In again

✅ If all steps done, it should work now!
