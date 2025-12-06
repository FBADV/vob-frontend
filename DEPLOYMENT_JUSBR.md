# Jus.br Integration - Deployment Guide

This guide provides step-by-step instructions for deploying and using the Jus.br integration in VOB Alaska.

---

## 📋 Prerequisites

Before deploying the Jus.br integration, ensure you have:

1. ✅ **Multi-Client Support** deployed and working
   - `process_parties` table created in Supabase
   - ProcessPartiesModal functional
   
2. ✅ **Node packages installed**:
   ```bash
   # Already installed in the project
   - uuid
   - lucide-react
   ```

3. ✅ **Supabase configured** with Row Level Security

---

## 🚀 Deployment Steps

### Step 1: Verify Files Are in Place

Ensure all Jus.br integration files exist:

#### TypeScript Types
- ✅ `src/types/jusbr.types.ts`

#### Services
- ✅ `src/services/jusbr-oauth.service.ts`
- ✅ `src/services/jusbr-api.service.ts`
- ✅ `src/services/jusbr-sync.service.ts`

#### React Hooks
- ✅ `src/hooks/useJusBr.ts`
- ✅ `src/hooks/useJusBrSync.ts`

#### UI Components
- ✅ `src/components/JusBrCard.tsx`
- ✅ `src/pages/JusBrCallback.tsx`

#### App Configuration
- ✅ `src/App.tsx` - Route `/auth/jusbr/callback` added
- ✅ `src/components/settings/SettingsIntegrations.tsx` - JusBrCard integrated
- ✅ `src/components/ProcessDetailsModal.tsx` - Sync button added

---

### Step 2: Configure OAuth Credentials

The Jus.br integration uses OAuth 2.0 for authentication. You'll need to configure:

#### In `jusbr-oauth.service.ts` (Lines 14-22):

```typescript
const OAUTH_CONFIG: OAuthConfig = {
    clientId: 'YOUR_JUSBR_CLIENT_ID', // ⚠️ TO BE CONFIGURED
    redirectUri: `${window.location.origin}/auth/jusbr/callback`,
    scope: 'openid profile email pje:read',
    authorizationEndpoint: 'https://sso.cnj.jus.br/auth',
    tokenEndpoint: 'https://sso.cnj.jus.br/token',
    userinfoEndpoint: 'https://sso.cnj.jus.br/userinfo'
};
```

> **Note**: The exact OAuth endpoints and client ID will need to be obtained from CNJ's developer portal or documentation. The URLs above are placeholders.

---

### Step 3: Configure PJe API Base URL

#### In `jusbr-api.service.ts` (Line 9):

```typescript
const API_BASE = 'https://api.pje.jus.br/api/v1'; // ⚠️ TO BE VERIFIED
```

> **Important**: PJe API endpoints vary by tribunal (TRT, TRF, TJ, etc.). This may need to be:
> - Configured per tribunal
> - Made dynamic based on process court type
> - Updated after testing with real credentials

---

### Step 4: Test Build

Build the project to ensure no compilation errors:

```bash
npm run build
```

If successful, you should see:
```
✓ built in Xms
```

---

### Step 5: Start Development Server

```bash
npm run dev
```

---

## 🧪 Testing the Integration

### Test 1: OAuth Authentication

1. Navigate to **Settings > Integrations**
2. Scroll to **"Jus.br / PJe"** card (second card)
3. Verify card shows:
   - ⚠️ **Desconectado** badge
   - Description of features
   - **"Conectar com Jus.br"** button
4. Click **"Conectar com Jus.br"**
5. You should be redirected to CNJ SSO (when configured)
6. After login, redirect back to `/auth/jusbr/callback`
7. Then redirect to Settings with **Conectado** status

> **Expected Behavior**:
> - Without real OAuth credentials, the login will fail
> - This is normal and expected during development
> - Card should handle errors gracefully

### Test 2: Sync Button Visibility

1. Open any process in **ProcessDetailsModal**
2. Check header buttons:
   - If **NOT authenticated**: Button should NOT appear
   - If **authenticated**: Golden **"Importar do Jus.br"** button appears

### Test 3: Data Sync (With Real Credentials)

Once OAuth is configured with real credentials:

1. Authenticate in **Settings > Integrations**
2. Open a process with a valid CNJ number
3. Click **"Importar do Jus.br"**
4. System should:
   - Fetch parties from PJe API
   - Create records in `process_parties` table
   - Show success message with count
   - Reload modal
5. Click **"Ver Partes"** to see imported parties

---

## 🔧 Configuration Options

### Token Storage

Current implementation uses `localStorage`. For production, consider:

```typescript
// In jusbr-oauth.service.ts
// TODO: Encrypt tokens before storing
private async storeTokens(tokens: OAuthTokens) {
    // Option 1: Encrypt with user password
    const encrypted = await encryptData(tokens, userPassword);
    localStorage.setItem(STORAGE_KEY, encrypted);
    
    // Option 2: Store in secure HttpOnly cookie (backend required)
    // await api.post('/auth/store-tokens', { tokens });
}
```

### Multi-Tribunal Support

To support different tribunals:

```typescript
// Create tribunal-specific config
const TRIBUNAL_CONFIGS = {
    'TRT': { apiBase: 'https://pje.trt.jus.br/api' },
    'TRF': { apiBase: 'https://pje.trf.jus.br/api' },
    'TJ':  { apiBase: 'https://pje.tj.jus.br/api' }
};

// Use based on process court type
const apiBase = TRIBUNAL_CONFIGS[process.courtType]?.apiBase || API_BASE;
```

---

## 🐛 Troubleshooting

### Issue: "OAuth endpoints not responding"
**Solution**: Verify CNJ SSO endpoints are correct. They may have changed or require registration.

### Issue: "Process parties not importing"
**Solution**: 
1. Check browser console for API errors
2. Verify PJe API endpoint is correct for the tribunal
3. Ensure process number is valid CNJ format

### Issue: "Tokens expire too quickly"
**Solution**: Implement token refresh in `useJusBr` hook (already included, but may need tuning).

### Issue: "Duplicate parties created"
**Solution**: The deduplication logic compares by `document + role`. Ensure PJe API returns consistent document formats.

---

## 📊 Monitoring

After deployment, monitor:

1. **OAuth Success Rate**: How many users successfully authenticate
2. **API Error Rate**: Failed calls to PJe API
3. **Sync Success Rate**: Successful party imports
4. **Token Refresh Rate**: How often tokens need refreshing

---

## 🔒 Security Checklist

Before production:

- [ ] OAuth client secret stored securely (environment variable)
- [ ] Tokens encrypted before localStorage (or use HTTP-only cookies)
- [ ] HTTPS enforced on redirect URI
- [ ] Row Level Security tested on `process_parties`
- [ ] Rate limiting implemented for PJe API calls
- [ ] Error messages don't expose sensitive data

---

## 📝 Next Steps

After basic deployment:

1. **Test with real OAB** credentials
2. **Validate PJe API responses** match expected structure
3. **Configure tribunal-specific** endpoints
4. **Implement token encryption**
5. **Add logging/monitoring** for production

---

## 🆘 Support

If you encounter issues:

1. Check browser console for errors
2. Review `jusbr-oauth.service.ts` for OAuth flow
3. Inspect network tab for API calls
4. Verify Supabase RLS policies

For CNJ/PJe API documentation:
- CNJ Developer Portal (to be determined)
- PJe API Documentation (tribunal-specific)

---

**Note**: This integration is ready for testing but requires real OAuth credentials and PJe API validation before production use. The 95% completion status reflects that the code is complete but needs real-world validation with actual CNJ/PJe systems.
