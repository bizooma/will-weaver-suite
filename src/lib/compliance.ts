// GDPR and privacy compliance utilities
import { logger } from './logger';

export interface UserDataExport {
  profile: any;
  drafts: any[];
  activityLog: any[];
  exportDate: string;
  retentionPeriod: string;
}

export interface CookieConsent {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  timestamp: string;
  version: string;
}

export interface DataRetentionPolicy {
  userProfiles: { period: number; unit: 'days' | 'months' | 'years' };
  drafts: { period: number; unit: 'days' | 'months' | 'years' };
  activityLogs: { period: number; unit: 'days' | 'months' | 'years' };
  deletedUserData: { period: number; unit: 'days' | 'months' | 'years' };
}

// Data retention policies
export const DATA_RETENTION_POLICY: DataRetentionPolicy = {
  userProfiles: { period: 3, unit: 'years' },
  drafts: { period: 7, unit: 'years' }, // Legal documents need longer retention
  activityLogs: { period: 2, unit: 'years' },
  deletedUserData: { period: 30, unit: 'days' }, // Grace period for account recovery
};

// Cookie consent management
class CookieManager {
  private readonly CONSENT_KEY = 'gdpr_cookie_consent';
  private readonly CONSENT_VERSION = '1.0';

  getConsent(): CookieConsent | null {
    try {
      const stored = localStorage.getItem(this.CONSENT_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      logger.error('Failed to read cookie consent', error as Error);
      return null;
    }
  }

  setConsent(consent: Omit<CookieConsent, 'timestamp' | 'version'>): void {
    try {
      const fullConsent: CookieConsent = {
        ...consent,
        timestamp: new Date().toISOString(),
        version: this.CONSENT_VERSION,
      };
      
      localStorage.setItem(this.CONSENT_KEY, JSON.stringify(fullConsent));
      
      logger.info('Cookie consent updated', { consent: fullConsent });
      
      // Apply consent settings
      this.applyConsentSettings(fullConsent);
    } catch (error) {
      logger.error('Failed to save cookie consent', error as Error);
    }
  }

  private applyConsentSettings(consent: CookieConsent): void {
    // Disable analytics if not consented
    if (!consent.analytics) {
      // Clear analytics cookies
      this.clearAnalyticsCookies();
    }

    // Disable marketing if not consented
    if (!consent.marketing) {
      // Clear marketing cookies
      this.clearMarketingCookies();
    }

    // Dispatch event for other components to listen to
    window.dispatchEvent(new CustomEvent('cookieConsentChanged', { 
      detail: consent 
    }));
  }

  private clearAnalyticsCookies(): void {
    // Clear Google Analytics cookies
    const analyticsCookies = ['_ga', '_gid', '_gat', '_gtag'];
    analyticsCookies.forEach(cookie => {
      document.cookie = `${cookie}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    });
  }

  private clearMarketingCookies(): void {
    // Clear marketing/advertising cookies
    const marketingCookies = ['_fbp', '_fbc'];
    marketingCookies.forEach(cookie => {
      document.cookie = `${cookie}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    });
  }

  hasValidConsent(): boolean {
    const consent = this.getConsent();
    if (!consent) return false;

    // Check if consent is still valid (1 year)
    const consentDate = new Date(consent.timestamp);
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    return consentDate > oneYearAgo && consent.version === this.CONSENT_VERSION;
  }

  needsConsent(): boolean {
    return !this.hasValidConsent();
  }
}

// GDPR data management
class GDPRDataManager {
  async exportUserData(userId: string): Promise<UserDataExport> {
    try {
      // This would fetch all user data from various sources
      const [profile, drafts, activityLog] = await Promise.all([
        this.fetchUserProfile(userId),
        this.fetchUserDrafts(userId),
        this.fetchUserActivityLog(userId),
      ]);

      const exportData: UserDataExport = {
        profile,
        drafts,
        activityLog,
        exportDate: new Date().toISOString(),
        retentionPeriod: this.getRetentionPeriodDescription(),
      };

      logger.info('User data export completed', { 
        userId, 
        exportSize: JSON.stringify(exportData).length 
      });

      return exportData;
    } catch (error) {
      logger.error('Failed to export user data', error as Error, { userId });
      throw new Error('Data export failed. Please try again or contact support.');
    }
  }

  async deleteUserData(userId: string, reason: string): Promise<void> {
    try {
      logger.info('Starting user data deletion', { userId, reason });

      // Mark user for deletion (soft delete first)
      await this.markUserForDeletion(userId, reason);

      // Schedule actual deletion after grace period
      await this.scheduleDataDeletion(userId);

      logger.info('User data deletion initiated', { userId });
    } catch (error) {
      logger.error('Failed to delete user data', error as Error, { userId });
      throw new Error('Data deletion failed. Please contact support.');
    }
  }

  async anonymizeUserData(userId: string): Promise<void> {
    try {
      // Replace PII with anonymized data
      await this.anonymizeUserProfile(userId);
      await this.anonymizeUserDrafts(userId);

      logger.info('User data anonymized', { userId });
    } catch (error) {
      logger.error('Failed to anonymize user data', error as Error, { userId });
      throw new Error('Data anonymization failed. Please contact support.');
    }
  }

  private async fetchUserProfile(userId: string): Promise<any> {
    // Fetch user profile data
    return { id: userId, anonymized: true };
  }

  private async fetchUserDrafts(userId: string): Promise<any[]> {
    // Fetch user drafts
    return [];
  }

  private async fetchUserActivityLog(userId: string): Promise<any[]> {
    // Fetch user activity logs
    return [];
  }

  private async markUserForDeletion(userId: string, reason: string): Promise<void> {
    // Mark user account for deletion
  }

  private async scheduleDataDeletion(userId: string): Promise<void> {
    // Schedule actual data deletion after grace period
  }

  private async anonymizeUserProfile(userId: string): Promise<void> {
    // Replace PII in user profile
  }

  private async anonymizeUserDrafts(userId: string): Promise<void> {
    // Anonymize personal data in drafts
  }

  private getRetentionPeriodDescription(): string {
    return `User profiles: ${DATA_RETENTION_POLICY.userProfiles.period} ${DATA_RETENTION_POLICY.userProfiles.unit}, ` +
           `Drafts: ${DATA_RETENTION_POLICY.drafts.period} ${DATA_RETENTION_POLICY.drafts.unit}, ` +
           `Activity logs: ${DATA_RETENTION_POLICY.activityLogs.period} ${DATA_RETENTION_POLICY.activityLogs.unit}`;
  }
}

// Legal compliance checker
export const checkLegalCompliance = () => {
  const checks = {
    hasPrivacyPolicy: !!document.querySelector('a[href="/privacy"]'),
    hasTermsOfService: !!document.querySelector('a[href="/terms"]'),
    hasCookieConsent: cookieManager.hasValidConsent(),
    hasDataProtectionNotice: !!document.querySelector('[data-gdpr-notice]'),
    hasSecureConnection: window.location.protocol === 'https:',
    hasLegalDisclaimers: document.body.textContent?.includes('demonstration purposes') || false,
  };

  const totalChecks = Object.keys(checks).length;
  const passedChecks = Object.values(checks).filter(Boolean).length;
  const complianceScore = Math.round((passedChecks / totalChecks) * 100);

  return {
    score: complianceScore,
    checks,
    isCompliant: complianceScore >= 90,
    recommendations: generateComplianceRecommendations(checks),
  };
};

const generateComplianceRecommendations = (checks: Record<string, boolean>) => {
  const recommendations: string[] = [];
  
  if (!checks.hasPrivacyPolicy) recommendations.push('Add accessible privacy policy');
  if (!checks.hasTermsOfService) recommendations.push('Add comprehensive terms of service');
  if (!checks.hasCookieConsent) recommendations.push('Implement cookie consent banner');
  if (!checks.hasDataProtectionNotice) recommendations.push('Add GDPR data protection notices');
  if (!checks.hasSecureConnection) recommendations.push('Ensure HTTPS is enabled');
  if (!checks.hasLegalDisclaimers) recommendations.push('Add legal disclaimers to demo content');
  
  return recommendations;
};

export const cookieManager = new CookieManager();
export const gdprDataManager = new GDPRDataManager();