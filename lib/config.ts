export interface AppConfig {
  env: 'development' | 'staging' | 'production';
  apiUrl: string;
  appName: string;
  appVersion: string;
  enableDebug: boolean;
  enableAnalytics: boolean;
  secureMode: boolean;
  stagingBanner: boolean;
}

export const config: AppConfig = {
  env: (process.env.NEXT_PUBLIC_APP_ENV as AppConfig['env']) || 'development',
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
  appName: process.env.NEXT_PUBLIC_APP_NAME || 'Invoice Manager',
  appVersion: process.env.NEXT_PUBLIC_APP_VERSION || '2.1.0',
  enableDebug: process.env.NEXT_PUBLIC_ENABLE_DEBUG === 'true',
  enableAnalytics: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
  secureMode: process.env.NEXT_PUBLIC_SECURE_MODE === 'true',
  stagingBanner: process.env.NEXT_PUBLIC_STAGING_BANNER === 'true',
};

export const isDevelopment = config.env === 'development';
export const isStaging = config.env === 'staging';
export const isProduction = config.env === 'production';

// Environment-specific settings
export const getEnvironmentColor = () => {
  switch (config.env) {
    case 'development':
      return 'bg-green-500';
    case 'staging':
      return 'bg-yellow-500';
    case 'production':
      return 'bg-red-500';
    default:
      return 'bg-gray-500';
  }
};

export const getEnvironmentName = () => {
  switch (config.env) {
    case 'development':
      return 'DEV';
    case 'staging':
      return 'STAGING';
    case 'production':
      return 'PROD';
    default:
      return 'UNKNOWN';
  }
};