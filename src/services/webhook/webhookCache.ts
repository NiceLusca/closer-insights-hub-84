
interface CacheData {
  leads: any[];
  timestamp: number;
  expiresIn: number;
}

class WebhookCache {
  private cache: CacheData | null = null;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

  isValid(): boolean {
    if (!this.cache) return false;
    return (Date.now() - this.cache.timestamp) < this.cache.expiresIn;
  }

  get(): any[] | null {
    if (!this.isValid()) return null;
    return this.cache.leads;
  }

  set(leads: any[]): void {
    this.cache = {
      leads,
      timestamp: Date.now(),
      expiresIn: this.CACHE_DURATION
    };
  }

  clear(): void {
    this.cache = null;
  }

  getStatus() {
    if (!this.cache) {
      return { cached: false, age: 0, expired: true };
    }
    
    const age = Date.now() - this.cache.timestamp;
    const expired = age >= this.cache.expiresIn;
    
    return {
      cached: true,
      age,
      expired,
      totalLeads: this.cache.leads.length
    };
  }

  getFallbackData(): any[] | null {
    return this.cache?.leads || null;
  }
}

export const webhookCache = new WebhookCache();
