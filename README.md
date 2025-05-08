# ChromeGambles Website

A secure, responsive gambling community website built with HTML, CSS, and JavaScript.

## Features

- Responsive design for all devices
- Firebase integration for leaderboards
- Age verification system
- GDPR-compliant cookie consent
- Security headers and best practices
- Optimized for performance

## Security Features

This project implements several security features:

- **Content Security Policy (CSP)**: Restricts resource loading to prevent XSS attacks
- **HTTP Strict Transport Security (HSTS)**: Enforces HTTPS connections
- **X-Content-Type-Options**: Prevents MIME type sniffing
- **X-Frame-Options**: Protects against clickjacking
- **Referrer-Policy**: Controls referrer information
- **Secure Firebase Configuration**: Uses environment variables for API keys
- **Age Verification**: Ensures users are 18+ before accessing content
- **Cookie Consent**: GDPR-compliant cookie consent mechanism
- **External Link Protection**: Uses rel="noopener noreferrer" for external links
- **Error Handling**: Graceful error handling for API failures

## Deployment

### Prerequisites

- GitHub account
- Basic knowledge of GitHub Actions

### Deployment Steps

1. **Fork or Clone the Repository**:
   ```
   git clone https://github.com/yourusername/ChromeGambles.git
   cd ChromeGambles
   ```

2. **Set Up GitHub Secrets**:
   - Go to your repository on GitHub
   - Navigate to Settings > Secrets and variables > Actions
   - Add the following secrets:
     - `FIREBASE_API_KEY`
     - `FIREBASE_AUTH_DOMAIN`
     - `FIREBASE_PROJECT_ID`
     - `FIREBASE_STORAGE_BUCKET`
     - `FIREBASE_MESSAGING_SENDER_ID`
     - `FIREBASE_APP_ID`
     - `FIREBASE_MEASUREMENT_ID`

3. **Push to GitHub**:
   ```
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

4. **GitHub Actions will automatically**:
   - Generate the Firebase configuration file
   - Optimize HTML, CSS, and JavaScript files
   - Deploy to GitHub Pages

5. **Configure Firebase Security Rules**:
   - Go to Firebase Console
   - Navigate to Firestore Database > Rules
   - Set up proper security rules to restrict access

## Local Development

1. **Clone the Repository**:
   ```
   git clone https://github.com/yourusername/ChromeGambles.git
   cd ChromeGambles
   ```

2. **Create a Local Firebase Configuration**:
   Create a file `js/firebase-config.js` with your Firebase configuration:
   ```javascript
   const firebaseConfig = {
     apiKey: "YOUR_API_KEY",
     authDomain: "YOUR_AUTH_DOMAIN",
     projectId: "YOUR_PROJECT_ID",
     storageBucket: "YOUR_STORAGE_BUCKET",
     messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
     appId: "YOUR_APP_ID",
     measurementId: "YOUR_MEASUREMENT_ID"
   };

   // Initialize Firebase
   firebase.initializeApp(firebaseConfig);
   const db = firebase.firestore();
   ```

3. **Run a Local Server**:
   You can use any local server, for example:
   - Python: `python -m http.server`
   - Node.js: `npx serve`
   - VS Code: Use the Live Server extension

## File Structure

```
ChromeGambles/
├── .github/
│   └── workflows/
│       └── deploy.yml       # GitHub Actions workflow
├── assets/
│   └── images-optimized/    # Optimized images
├── css/
│   └── style.css            # Main stylesheet
├── includes/
│   └── meta-tags.html       # Common meta tags
├── js/
│   ├── age-verification.js  # Age verification script
│   ├── cookie-consent.js    # Cookie consent script
│   ├── firebase-config.js   # Firebase configuration (generated)
│   └── script.js            # Main JavaScript file
├── .gitignore               # Git ignore file
├── .htaccess                # Apache server configuration
├── _headers                 # Netlify headers configuration
├── web.config               # IIS server configuration
├── index.html               # Home page
├── partnerships.html        # Partnerships page
├── leaderboard.html         # Leaderboard page
├── giveaways.html           # Giveaways page
├── community.html           # Community page
├── privacy-policy.html      # Privacy policy page
├── terms.html               # Terms of service page
├── faq.html                 # FAQ page
└── README.md                # This file
```

## Security Best Practices

1. **Keep Firebase Security Rules Strict**:
   - Only allow read access to necessary collections
   - Implement user authentication for write operations

2. **Regular Updates**:
   - Keep all libraries and dependencies updated
   - Monitor GitHub security advisories

3. **Content Security Policy**:
   - Regularly review and update CSP headers
   - Use CSP reporting to monitor violations

4. **HTTPS Enforcement**:
   - Always use HTTPS in production
   - Implement HSTS preloading

5. **Input Validation**:
   - Validate all user inputs
   - Sanitize data before displaying

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Design and maintenance by [@Llakadmatatag](https://x.com/Llakadmatatag)
- Built with [VS Code](https://code.visualstudio.com/)
