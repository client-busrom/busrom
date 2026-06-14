export class Semaphore {
  private max: number;
  private current: number;
  private queue: Array<() => void>;

  constructor(max: number) {
    this.max = max;
    this.current = 0;
    this.queue = [];
  }

  async acquire(): Promise<void> {
    if (this.current < this.max) {
      this.current++;
      return Promise.resolve();
    }

    return new Promise<void>((resolve) => {
      this.queue.push(resolve);
    });
  }

  release(): void {
    if (this.queue.length > 0) {
      const next = this.queue.shift();
      if (next) next();
    } else {
      this.current--;
    }
  }

  async run<T>(fn: () => Promise<T>): Promise<T> {
    await this.acquire();
    try {
      return await fn();
    } finally {
      this.release();
    }
  }
}

// Limit concurrent API requests to CMS during Next.js SSG build
// AWS t3/t4g instances and Load Balancers will mark target as unhealthy if overwhelmed.
// Next.js fires hundreds of concurrent requests by default. We limit it to 1 for serial execution.
export const fetchLimiter = new Semaphore(1);
