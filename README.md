# DealSpot - React Native Expo App

A comprehensive React Native Expo application with advanced API interceptor service and Supabase authentication integration.

## Features

### Authentication
- **Email/Password Authentication** - Secure sign-in and sign-up
- **OAuth Integration** - Google and Facebook sign-in
- **Session Management** - Automatic token refresh and persistence
- **Secure Storage** - Cross-platform secure token storage

### API Service
- **Centralized HTTP Client** - Unified API communication
- **Request/Response Interceptors** - Automatic auth headers and error handling
- **Token Management** - Automatic refresh and retry logic
- **Error Handling** - Comprehensive error management
- **Type Safety** - Full TypeScript support

### Architecture
- **Context API** - Global authentication state
- **Custom Hooks** - Reusable API and auth logic
- **Service Layer** - Modular service architecture
- **Type Definitions** - Comprehensive TypeScript types

## Setup

### Environment Variables

Create a `.env` file in the root directory:

```env
# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# OAuth Configuration
EXPO_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
EXPO_PUBLIC_FACEBOOK_APP_ID=your_facebook_app_id

# API Configuration
EXPO_PUBLIC_API_BASE_URL=https://api.yourapp.com
```

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

## Usage

### Authentication

```typescript
import { useAuthContext } from '@/contexts/AuthContext';

function LoginComponent() {
  const { signInWithEmail, signInWithGoogle, loading, error } = useAuthContext();

  const handleLogin = async () => {
    try {
      await signInWithEmail('user@example.com', 'password');
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    // Your login UI
  );
}
```

### API Requests

```typescript
import { useApi } from '@/hooks/useApi';

function ProductList() {
  const { data, loading, error, execute } = useApi<Product[]>('/products');

  useEffect(() => {
    execute();
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return (
    // Your product list UI
  );
}
```

### Direct API Service

```typescript
import { apiService } from '@/services/api';

// GET request
const response = await apiService.get<User[]>('/users');

// POST request
const newUser = await apiService.post<User>('/users', {
  name: 'John Doe',
  email: 'john@example.com'
});

// With retry logic
const data = await apiService.withRetry(
  () => apiService.get('/important-data'),
  3, // max retries
  1000 // delay between retries
);
```

## Services

### AuthService
- Email/password authentication
- OAuth providers (Google, Facebook)
- Session management
- Token refresh
- Secure storage

### ApiService
- HTTP request handling
- Request/response interceptors
- Error handling
- Retry logic
- File uploads
- Pagination support

### StorageService
- Cross-platform secure storage
- Web localStorage fallback
- Error handling

## Hooks

### useAuth
- Authentication state management
- Login/logout actions
- Token refresh
- Error handling

### useApi
- HTTP request management
- Loading states
- Error handling
- Retry functionality

### usePaginatedApi
- Paginated data loading
- Infinite scroll support
- Load more functionality

## Types

Comprehensive TypeScript definitions for:
- Authentication (User, AuthSession, AuthError)
- API (ApiResponse, ApiError, RequestConfig)
- Environment variables

## Security Features

- Secure token storage
- Automatic token refresh
- Request/response validation
- Error sanitization
- HTTPS enforcement

## Platform Support

- **iOS** - Full native support
- **Android** - Full native support  
- **Web** - Full web support with fallbacks

## Error Handling

- Network error recovery
- Authentication error handling
- Retry mechanisms
- User-friendly error messages
- Development logging

## Contributing

1. Follow TypeScript best practices
2. Add proper error handling
3. Include comprehensive types
4. Test on all platforms
5. Update documentation

## License

MIT License