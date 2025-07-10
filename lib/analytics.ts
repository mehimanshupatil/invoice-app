import { config } from './config';
import { logger } from './logger';

interface AnalyticsEvent {
  event: string;
  properties?: Record<string, any>;
  userId?: string;
}

class Analytics {
  private enabled: boolean;

  constructor() {
    this.enabled = config.enableAnalytics;
  }

  track(event: string, properties?: Record<string, any>, userId?: string): void {
    if (!this.enabled) {
      logger.debug('Analytics disabled, skipping event', { event, properties });
      return;
    }

    const analyticsEvent: AnalyticsEvent = {
      event,
      properties: {
        ...properties,
        environment: config.env,
        timestamp: new Date().toISOString(),
      },
      userId,
    };

    // In a real implementation, you would send this to your analytics service
    logger.info('Analytics event tracked', analyticsEvent);

    // Example: Send to analytics service
    // this.sendToAnalyticsService(analyticsEvent);
  }

  page(pageName: string, properties?: Record<string, any>): void {
    this.track('page_view', {
      page: pageName,
      ...properties,
    });
  }

  identify(userId: string, traits?: Record<string, any>): void {
    if (!this.enabled) {
      return;
    }

    logger.info('User identified', { userId, traits });
    // Send to analytics service
  }

  private sendToAnalyticsService(event: AnalyticsEvent): void {
    // Implementation would depend on your analytics provider
    // Examples: Google Analytics, Mixpanel, Segment, etc.
    
    if (typeof window !== 'undefined') {
      // Client-side analytics
      // gtag('event', event.event, event.properties);
    }
  }
}

export const analytics = new Analytics();