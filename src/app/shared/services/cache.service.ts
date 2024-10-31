import { Injectable, computed, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class CacheService<T> {
  private storage: Record<string, T> = {};
  public keepAlive = signal(false);

  save(key: string, data: T): void {
    this.storage[key] = data;
  }

  load(key: string): T | undefined {
    return this.storage[key];
  }
}
