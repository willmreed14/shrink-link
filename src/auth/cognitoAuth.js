import { UserManager } from "oidc-client-ts";

const cognitoAuthConfig = {
    authority: "https://cognito-idp.us-east-1.amazonaws.com/us-east-1_XXXXXXXXX",
    client_id: "3icpkdg6556jls0o34vv81frvf",
    redirect_uri: "https://shrinklink.xyz",
    response_type: "code",
    scope: "phone openid email"
};

export const userManager = new UserManager(cognitoAuthConfig);

export async function signOutRedirect() {
    const clientId = "3icpkdg6556jls0o34vv81frvf";
    const logoutUri = "<logout uri>";
    const cognitoDomain = "https://<user pool domain>";
    window.location.href = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${logoutUri}`;
}
