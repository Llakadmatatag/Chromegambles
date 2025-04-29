/**
 * Secure Firebase Configuration
 * This file contains obfuscated Firebase configuration to improve security
 * while maintaining functionality.
 */

// Function to decode Base64 strings
function decodeBase64(str) {
    try {
        // Use built-in atob function for Base64 decoding
        return atob(str);
    } catch (e) {
        console.error('Error decoding Base64:', e);
        return '';
    }
}

// XFUN Firebase configuration (encoded)
const xfunFirebaseConfigEncoded = {
    apiKey: "QUl6YVN5REtHQWZtcHd2YTJreTRMVTdvUWtJVFF2c2JuQVcxcmpF",
    projectId: "Y2hyb21lLXMteGZ1bi1sYg==",
    authDomain: "Y2hyb21lLXMteGZ1bi1sYi5maXJlYmFzZWFwcC5jb20=",
    storageBucket: "Y2hyb21lLXMteGZ1bi1sYi5hcHBzcG90LmNvbQ==",
    messagingSenderId: "MTkzMDYzMjg4Nzc3",
    appId: "MToxOTMwNjMyODg3Nzc6d2ViOmY4MmMzZDhmMjQ1ZmE3YmI2MzcyMTg="
};

// RAINGG Firebase configuration (encoded)
const rainggFirebaseConfigEncoded = {
    apiKey: "QUl6YVN5RFRDWFdLVmVSWlplRWNYb292cGNOOXhaV1FxZ3N2SHFN",
    projectId: "cmFpbmdnLWxiLWNocm9tZQ==",
    authDomain: "cmFpbmdnLWxiLWNocm9tZS5maXJlYmFzZWFwcC5jb20=",
    storageBucket: "cmFpbmdnLWxiLWNocm9tZS5hcHBzcG90LmNvbQ==",
    messagingSenderId: "MTA3Nzg3ODAzNjI2Nw==",
    appId: "MToxMDc3ODc4MDM2MjY3OndlYjozODcwYTJkZGQyNmViMDE2Yjc1NzZl",
    experimentalForceLongPolling: true,
    experimentalAutoDetectLongPolling: true
};

// Function to decode Firebase configuration
function getFirebaseConfig(platform) {
    if (platform === 'xfun') {
        return {
            apiKey: decodeBase64(xfunFirebaseConfigEncoded.apiKey),
            authDomain: decodeBase64(xfunFirebaseConfigEncoded.authDomain),
            projectId: decodeBase64(xfunFirebaseConfigEncoded.projectId),
            storageBucket: decodeBase64(xfunFirebaseConfigEncoded.storageBucket),
            messagingSenderId: decodeBase64(xfunFirebaseConfigEncoded.messagingSenderId),
            appId: decodeBase64(xfunFirebaseConfigEncoded.appId)
        };
    } else if (platform === 'raingg') {
        return {
            apiKey: decodeBase64(rainggFirebaseConfigEncoded.apiKey),
            authDomain: decodeBase64(rainggFirebaseConfigEncoded.authDomain),
            projectId: decodeBase64(rainggFirebaseConfigEncoded.projectId),
            storageBucket: decodeBase64(rainggFirebaseConfigEncoded.storageBucket),
            messagingSenderId: decodeBase64(rainggFirebaseConfigEncoded.messagingSenderId),
            appId: decodeBase64(rainggFirebaseConfigEncoded.appId),
            experimentalForceLongPolling: rainggFirebaseConfigEncoded.experimentalForceLongPolling,
            experimentalAutoDetectLongPolling: rainggFirebaseConfigEncoded.experimentalAutoDetectLongPolling
        };
    }
    return null;
}

// Export the configuration getter function
window.getFirebaseConfig = getFirebaseConfig;
