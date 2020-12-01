import { Injectable, ɵConsole } from '@angular/core';
import { stringify } from 'querystring';
import { apiKey, Country } from '../model/model';
import { DatabaseService } from './database.service';
import { HttpService } from './http.service';

@Injectable({
  providedIn: 'root',
})
export class NewsService {
  apiKey: string;
  countryListData: Country;
  constructor(private db: DatabaseService, private http: HttpService) {}

  async saveAPIKey(apiKey: apiKey) {
    await this.db.saveAPI(apiKey);
    let result = await this.db.getApi();
    this.apiKey = result['apiKey'];

    console.log(this.apiKey);
  }

  async getAPIKey() {
    try {
      let result = await this.db.getApi();
      this.apiKey = result['apiKey'];
      return { apiKey: result.apiKey };
    } catch (error) {
      return { apiKey: '' };
    }
  }

  async deleteAPIKey() {
    this.db.deleteAPI();
  }

  async countryListInit(): Promise<Country[]> {
    let DBData = await this.getCountriesFromDB();
    if (DBData) {
      return DBData;
    } else {
      console.log('getting from API!!');
      let results = await this.http.getCountriesData().toPromise();
      let list = results.map((c) => {
        return {
          code: c['alpha2Code'].toLowerCase(),
          name: c['name'],
          flag: c['flag'],
        } as Country;
      });
      this.db.saveCountries(list);
      return list;
    }
  }

  async getCountriesFromDB() {
    try {
      let result = await this.db.getCountries();
      this.countryListData = await result;
      if (result) {
        //Remove db PK
        delete result['id'];
      }
      return result;
    } catch (error) {
      console.log(error);
    }
  }

  async getHeadlines(countryCode: string) {
    // Ensure api key is available -- failsafe
    await this.getAPIKey();

    // Get headline from DB
    let headlineDB = await this.db.getHeadlines(countryCode);

    if (headlineDB) {
      // Check timestamp, dispose if exceeded expiry duration
      let cachedTime = Date.parse(headlineDB['timestamp']);
      let timeDiff = (Date.now() - cachedTime) / 1000 / 60;

      if (timeDiff >= 5) {
        let payload;
        console.log('Time greater than 5 minute!');

        payload = await this.headlineAPICall(countryCode);
        await this.db.updateCache(countryCode, payload);
        return await this.db.getHeadlines(countryCode);
      }
      // Serve from DB if duration not expired
      console.log('return cache');
      return headlineDB;
    } else {
      let payload;
      payload = await this.headlineAPICall(countryCode);
      console.log(payload);
      await this.db.saveHeadlines(payload);
      return await this.db.getHeadlines(countryCode);
    }
  }

  async headlineAPICall(countryCode: string) {
    let results = await this.http.getHeadLines(countryCode, this.apiKey);
    // append timestamp and code into result
    results['timestamp'] = new Date();
    results['code'] = countryCode;
    return results;
  }

  async saveArticle(countryCode: string, article: {}) {
    let results = await this.db.getHeadlines(countryCode);
    let originalArticle = results['articles'];
    let savedArticle = results['savedArticle'];

    // Saved Article is not guaranteed to be in DB, only exists if user save
    if (!savedArticle) {
      savedArticle = [];
    }

    // check if article exists
    let checkStatus: boolean = true;
    if (savedArticle.length) {
      savedArticle.forEach((saved) => {
        if (saved['title'] === article['title']) {
          console.log('article exists in savedDB');
          checkStatus = false;
        }
      });
    }

    // If article to be save does not exists in savedArticle, loop to get index to remove from original article
    if (checkStatus) {
      savedArticle.push(article);
      //Remove from original article
      let articleIndex: number;
      originalArticle.forEach((saved, index) => {
        if (saved['title'] === article['title']) {
          console.log('article exists in savedDB');
          articleIndex = index;
          console.log(articleIndex);
        }
      });
      // Remove the article
      originalArticle.splice(articleIndex, 1);
      console.log('removed');

      await this.db.updateCache(countryCode, {
        savedArticle: savedArticle,
        articles: originalArticle,
      });
    }
  }

  async deleteArticle(countryCode: string, article: {}) {
    let results = await this.db.getHeadlines(countryCode);
    let savedArticle = results['savedArticle'];
    let originalArticle = results['articles'];
    if (!savedArticle) {
      return;
    }

    // check if article exists
    let articleIndex: number;
    if (savedArticle.length) {
      savedArticle.forEach((saved, index) => {
        if (saved['title'] === article['title']) {
          console.log('article exists in savedDB');
          articleIndex = index;
          console.log(articleIndex);
        }
      });
    }

    if (articleIndex >= 0) {
      savedArticle.splice(articleIndex, 1);
      originalArticle.unshift(article);

      await this.db.updateCache(countryCode, {
        savedArticle: savedArticle,
        articles: originalArticle,
      });
    }
  }
}
