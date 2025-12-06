import type {
    OAuthTokens,
    OAuthConfig,
    JusBrAuthState,
    // PJeProcess,
    // PJeProcessDetails,
    // PJeParty,
    // PJeMovement,
    // PJeSearchFilters,
    // PJeAPIResponse
} from '../types/jusbr.types';

/**
 * Jus.br OAuth Service
 * Handles authentication with CNJ's SSO using OAuth 2.0 + OpenID Connect
 * Supports certificate A1 authentication
 */
class JusBrOAuthService {
    private readonly SSO_BASE = import.meta.env.VITE_JUSBR_SSO_URL || 'https://sso.cloud.pje.jus.br/auth/realms/pje';
    private readonly CLIENT_ID = import.meta.env.VITE_JUSBR_CLIENT_ID || 'jusbr';

    private config: OAuthConfig;

    constructor() {
        const redirectUri = import.meta.env.VITE_JUSBR_REDIRECT_URI || `${window.location.origin}/auth/jusbr/callback`;

        this.config = {
            clientId: this.CLIENT_ID,
            redirectUri: redirectUri,
            scope: 'openid',
            authorizationEndpoint: `${this.SSO_BASE}/protocol/openid-connect/auth`,
            tokenEndpoint: `${this.SSO_BASE}/protocol/openid-connect/token`,
            userinfoEndpoint: `${this.SSO_BASE}/protocol/openid-connect/userinfo`
        };

        if (!import.meta.env.VITE_JUSBR_CLIENT_ID) {
            console.warn('Jus.br OAuth: VITE_JUSBR_CLIENT_ID not set, using default');
        }
    }

    /**
     * STEP 1: Initiate OAuth flow
     * Redirects user to CNJ SSO for authentication
     */
    async initiateAuth(): Promise<void> {
        const state = this.generateRandomString(32);
        const nonce = this.generateRandomString(32);
        const codeVerifier = this.generateRandomString(64);
        const codeChallenge = await this.generateCodeChallenge(codeVerifier);

        // Store PKCE values in session storage
        sessionStorage.setItem('oauth_state', state);
        sessionStorage.setItem('oauth_nonce', nonce);
        sessionStorage.setItem('code_verifier', codeVerifier);

        // Build authorization URL
        const authUrl = new URL(this.config.authorizationEndpoint);
        authUrl.searchParams.set('client_id', this.config.clientId);
        authUrl.searchParams.set('redirect_uri', this.config.redirectUri);
        authUrl.searchParams.set('response_type', 'code');
        authUrl.searchParams.set('scope', this.config.scope);
        authUrl.searchParams.set('state', state);
        authUrl.searchParams.set('nonce', nonce);
        authUrl.searchParams.set('code_challenge', codeChallenge);
        authUrl.searchParams.set('code_challenge_method', 'S256');

        // Redirect to CNJ SSO
        window.location.href = authUrl.toString();
    }

    /**
     * STEP 2: Handle OAuth callback
     * Exchange authorization code for tokens
     */
    async handleCallback(code: string, state: string): Promise<OAuthTokens> {
        // Validate state (CSRF protection)
        const savedState = sessionStorage.getItem('oauth_state');
        if (!savedState || state !== savedState) {
            throw new Error('Invalid state parameter - possible CSRF attack');
        }

        // Get code verifier for PKCE
        const codeVerifier = sessionStorage.getItem('code_verifier');
        if (!codeVerifier) {
            throw new Error('Missing code verifier');
        }

        // Exchange code for tokens
        const response = await fetch(this.config.tokenEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                grant_type: 'authorization_code',
                code: code,
                client_id: this.config.clientId,
                redirect_uri: this.config.redirectUri,
                code_verifier: codeVerifier
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(`Token exchange failed: ${error.error_description || error.error}`);
        }

        const data = await response.json();

        // Clean up session storage
        sessionStorage.removeItem('oauth_state');
        sessionStorage.removeItem('oauth_nonce');
        sessionStorage.removeItem('code_verifier');

        // Store tokens
        const tokens: OAuthTokens = {
            accessToken: data.access_token,
            refreshToken: data.refresh_token,
            idToken: data.id_token,
            expiresIn: data.expires_in,
            tokenType: data.token_type,
            scope: data.scope,
            obtainedAt: Date.now()
        };

        await this.storeTokens(tokens);

        return tokens;
    }

    /**
     * STEP 3: Refresh access token
     */
    async refreshToken(refreshToken: string): Promise<OAuthTokens> {
        const response = await fetch(this.config.tokenEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                grant_type: 'refresh_token',
                refresh_token: refreshToken,
                client_id: this.config.clientId
            })
        });

        if (!response.ok) {
            throw new Error('Token refresh failed');
        }

        const data = await response.json();

        const tokens: OAuthTokens = {
            accessToken: data.access_token,
            refreshToken: data.refresh_token || refreshToken,
            idToken: data.id_token,
            expiresIn: data.expires_in,
            tokenType: data.token_type,
            scope: data.scope,
            obtainedAt: Date.now()
        };

        await this.storeTokens(tokens);

        return tokens;
    }

    /**
     * Get valid access token (refresh if needed)
     */
    async getValidAccessToken(): Promise<string | null> {
        const tokens = await this.loadTokens();

        if (!tokens) {
            return null;
        }

        // Check if token is expired
        const expiryTime = tokens.obtainedAt + (tokens.expiresIn * 1000);
        const now = Date.now();

        // Refresh if expired or expiring in next 5 minutes
        if (now >= expiryTime - 300000) {
            try {
                const newTokens = await this.refreshToken(tokens.refreshToken);
                return newTokens.accessToken;
            } catch (error) {
                console.error('Token refresh failed:', error);
                return null;
            }
        }

        return tokens.accessToken;
    }

    /**
     * Get current authentication state
     */
    async getAuthState(): Promise<JusBrAuthState> {
        const tokens = await this.loadTokens();

        if (!tokens) {
            return { isAuthenticated: false };
        }

        const expiresAt = tokens.obtainedAt + (tokens.expiresIn * 1000);

        return {
            isAuthenticated: true,
            tokens,
            expiresAt
        };
    }

    /**
     * Logout (clear tokens)
     */
    async logout(): Promise<void> {
        localStorage.removeItem('jusbr_tokens');

        // Optional: Call logout endpoint
        // const logoutUrl = `${this.SSO_BASE}/protocol/openid-connect/logout`;
        // Can redirect to logout URL if needed
    }

    // Helper: Store tokens securely
    private async storeTokens(tokens: OAuthTokens): Promise<void> {
        // Store in localStorage (or use encrypted storage)
        // In production, consider using IndexedDB with encryption
        localStorage.setItem('jusbr_tokens', JSON.stringify(tokens));
    }

    // Helper: Load tokens
    private async loadTokens(): Promise<OAuthTokens | null> {
        const data = localStorage.getItem('jusbr_tokens');
        if (!data) {
            return null;
        }

        try {
            return JSON.parse(data) as OAuthTokens;
        } catch (error) {
            console.error('Failed to parse tokens:', error);
            return null;
        }
    }

    // Helper: Generate random string
    private generateRandomString(length: number): string {
        const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const array = new Uint8Array(length);
        crypto.getRandomValues(array);
        return Array.from(array)
            .map(x => possible[x % possible.length])
            .join('');
    }

    // Helper: Generate PKCE code challenge
    private async generateCodeChallenge(verifier: string): Promise<string> {
        const encoder = new TextEncoder();
        const data = encoder.encode(verifier);
        const hash = await crypto.subtle.digest('SHA-256', data);

        // Base64 URL encode
        return btoa(String.fromCharCode(...new Uint8Array(hash)))
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, '');
    }
}

export const jusBrOAuthService = new JusBrOAuthService();
