import { userManager } from "./main.js";

userManager.signinCallback().then(function (user) {
    // Store tokens in localStorage
    localStorage.setItem("access_token", user.access_token);
    localStorage.setItem("id_token", user.id_token);
    localStorage.setItem("refresh_token", user.refresh_token);
    localStorage.setItem("user_email", user.profile.email);

    // Redirect back to the home page
    window.location.href = "/";
}).catch(error => {
    console.error("Error handling sign-in callback:", error);
    document.body.innerHTML = "<p>Login failed. Please try again.</p>";
});
