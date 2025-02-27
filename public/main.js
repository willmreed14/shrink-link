// Load oidc-client-ts from a CDN
import { UserManager } from "https://cdn.jsdelivr.net/npm/oidc-client-ts@2.0.1/+esm";

const cognitoAuthConfig = {
    authority: "https://cognito-idp.us-east-1.amazonaws.com/us-east-1_vJhXhdYyl",
    client_id: "3icpkdg6556jls0o34vv81frvf",
    redirect_uri: "https://shrinklink.xyz/callback",
    response_type: "code",
    scope: "phone openid email"
};

export const userManager = new UserManager(cognitoAuthConfig);

export async function signOutRedirect() {
    try {
        await userManager.signoutRedirect();  // Redirects to AWS Cognito logout
        localStorage.clear();  // Clear stored tokens
        window.location.href = "/";  // Redirect back to home page
    } catch (error) {
        console.error("❌ Error signing out:", error);
    }
}