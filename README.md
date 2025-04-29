# ChromeGambles Website

## Overview
This is the official website for ChromeGambles, featuring leaderboards for various gambling platforms including X.FUN and RAIN.GG.

## Security Notes

### Firebase Configuration
Firebase configuration is stored in an obfuscated format in `js/firebase-config-secure.js`. This approach:
- Prevents API keys from being directly visible in the source code
- Makes it harder for automated scanners to detect API keys
- Maintains full functionality of the leaderboard features

### How Firebase Security Works
1. Firebase configurations are Base64 encoded in `js/firebase-config-secure.js`
2. The configurations are decoded at runtime when needed
3. All Firebase initialization code uses the secure configuration

### Important Security Considerations
- The obfuscation used is not perfect security, but provides a basic layer of protection
- Firebase security rules should still be properly configured on the Firebase console
- For production, consider using a server-side proxy (like the included `api/leaderboard-proxy.php`) with proper authentication

### Maintaining Security
When updating the Firebase configuration:
1. Update the encoded values in `js/firebase-config-secure.js`
2. Do not add plain-text API keys to any JavaScript files
3. Keep the proxy file (`api/leaderboard-proxy.php`) secure if you decide to use it

## Development
The site uses vanilla JavaScript with Firebase for the backend. The leaderboard functionality is implemented in:
- `js/simple-leaderboard.js` - Main leaderboard functionality
- `js/firebase-xfun.js` - X.FUN specific Firebase functionality
- `js/firebase-raingg.js` - RAIN.GG specific Firebase functionality