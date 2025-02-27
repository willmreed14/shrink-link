// Load oidc-client-ts from a CDN
import { UserManager } from "https://cdn.jsdelivr.net/npm/oidc-client-ts@2.0.1/+esm";

const cognitoAuthConfig = {
    authority: "https://cognito-idp.us-east-1.amazonaws.com/us-east-1_vJhXhdYyl",
    client_id: "3icpkdg6556jls0o34vv81frvf",
    redirect_uri: "http://localhost:8000/callback",
    response_type: "code",
    scope: "phone openid email"
};

export const userManager = new UserManager(cognitoAuthConfig);
