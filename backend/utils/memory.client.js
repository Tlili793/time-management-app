class MemoryCache {
  constructor() {
    this.store = new Map();
    this.sets = new Map();
    this.timeouts = new Map();
  }

  async set(key, value, mode, seconds) {
    this.store.set(key, value);

    if (this.timeouts.has(key)) {
      clearTimeout(this.timeouts.get(key));
      this.timeouts.delete(key);
    }

    if (mode === "EX" && seconds) {
      const timeout = setTimeout(() => {
        this.store.delete(key);
        this.timeouts.delete(key);
      }, seconds * 1000);
      
      if (timeout.unref) timeout.unref();
      
      this.timeouts.set(key, timeout);
    }
    return "OK";
  }

  async get(key) {
    return this.store.get(key) || null;
  }

  async del(key) {
    const deleted = this.store.delete(key);
    if (this.timeouts.has(key)) {
      clearTimeout(this.timeouts.get(key));
      this.timeouts.delete(key);
    }
    return deleted ? 1 : 0;
  }

  async sadd(key, member) {
    if (!this.sets.has(key)) {
      this.sets.set(key, new Set());
    }
    this.sets.get(key).add(member);
    return 1;
  }
}

const memoryClient = new MemoryCache();
export default memoryClient;