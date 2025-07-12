'use client';

import { config, getEnvironmentColor, getEnvironmentName, isDevelopment, isStaging } from '@/lib/config';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Info } from 'lucide-react';

export function EnvironmentBanner() {
  // Only show banner in development and staging
  if (!isDevelopment && !isStaging) {
    return null;
  }

  return (
    <div className={`${getEnvironmentColor()} text-white py-2 px-4 relative z-50`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {isStaging ? (
            <AlertTriangle className="h-4 w-4" />
          ) : (
            <Info className="h-4 w-4" />
          )}
          <span className="text-sm font-medium">
            {getEnvironmentName()} Environment
          </span>
          <Badge variant="outline" className="text-white border-white/30">
            {config.appVersion}
          </Badge>
        </div>
        <div className="text-xs opacity-90">
          {isStaging && 'This is a staging environment - changes may not persist'}
          {isDevelopment && 'Development mode - debug features enabled'}
        </div>
      </div>
    </div>
  );
}