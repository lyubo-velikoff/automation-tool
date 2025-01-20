# Prompt 08: Implement Popup-Based Authentication Flow

## Goal
Replace the current Supabase authentication implementation with a **popup-based authentication flow**, ensuring a seamless user experience without full-page reloads. No other functionality should be modified—only the authentication method should be replaced.

## Steps
1. **Popup-Based Flow Implementation:**
   - Modify the existing authentication to open a popup window for login.
   - The popup should direct users to a dedicated `/auth/popup` page.
   - Upon successful login, pass the session data to the main window via `postMessage` or `localStorage`.

2. **Popup Authentication Page (`/auth/popup`)**
   - Implement a page that triggers `supabase.auth.signInWithOAuth`.
   - Handle the redirect and pass the authentication result back to the main window.
   - Ensure the popup window closes automatically after authentication.

3. **Authentication Callback Handling (`/auth/callback`)**
   - Process Supabase's OAuth redirect response and store the session securely.
   - Send session data to the parent window and close the popup.

4. **Main Page Authentication Handling:**
   - Update the existing logic to listen for authentication messages via `window.postMessage` or check `localStorage` for tokens.
   - Refresh the UI accordingly without reloading the page.

5. **Logout Functionality:**
   - Ensure that the `signOut()` function correctly clears the session.
   - Close any authentication popups if they remain open.

6. **Security Considerations:**
   - Validate the event origin when using `postMessage` to avoid unauthorized access.
   - Ensure authentication only works on secure environments (HTTPS for production).

7. **Testing Requirements:**
   - Test with supported providers (Google, GitHub) to confirm login/logout workflows.
   - Ensure the popup experience works across different browsers.
   - Handle popup blockers gracefully.

## Expected Outcome
- Users should be able to sign in via a popup window without navigating away from the main page.
- The authentication state should persist correctly, and the UI should update seamlessly.
- Logout should work as expected, clearing sessions and UI state.

## Summary
*(AI should fill this in after successful task completion)*

