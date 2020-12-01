import { Injectable } from '@angular/core';
import Dexie from 'dexie';
import { apiKey } from '../model/model';

@Injectable({
  providedIn: 'root',
})
export class DatabaseService extends Dexie {
  apiDB: Dexie.Table<any, any>;
  countryDB: Dexie.Table<any, any>;
  newsDB: Dexie.Table<any, any>;
  constructor() {
    super('newsDB');
    this.version(1).stores({
      apiDB: '++id',
      countryDB: '++id',
      newsDB: 'code',
    });
    this.apiDB = this.table('apiDB');
    this.countryDB = this.table('countryDB');
    this.newsDB = this.table('newsDB');
  }

  async saveAPI(apiKey: apiKey) {
    await this.apiDB.clear();
    await this.apiDB.add(apiKey, '1');
  }

  async deleteAPI() {
    await this.apiDB.clear();
  }

  async getApi() {
    // Get the first item
    return await this.apiDB.toCollection().first();
  }

  async saveCountries(countries) {
    await this.countryDB.clear();
    return await this.countryDB.put(countries);
  }

  async getCountries() {
    return await this.countryDB.toCollection().first();
  }

  async saveHeadlines(headline: {}) {
    return await this.newsDB.put(headline);
  }

  async getHeadlines(code: string) {
    return await this.newsDB.get(code);
  }

  async deleteHeadlines(code: string) {
    return await this.newsDB.delete(code);
  }

  // Adopt update to retain saved article
  async updateCache(countryCode: string, payload: {}) {
    return await this.newsDB.update(countryCode, payload);
  }
}
