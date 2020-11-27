import { Injectable, ɵConsole } from '@angular/core';
import { stringify } from 'querystring';
import { apiKey } from '../model/model';
import { DatabaseService } from './database.service';
import { HttpService } from './http.service';

@Injectable({
  providedIn: 'root',
})
export class NewsService {
  apiKey: string;
  countryListData: [{}];
  countryList: string[] = [
    'ae',
    'ar',
    'at',
    'au',
    'be',
    'bg',
    'br',
    'ca',
    'ch',
    'cn',
    'co',
    'cu',
    'cz',
    'de',
    'eg',
    'fr',
    'gb',
    'gr',
    'hk',
    'hu',
    'id',
    'ie',
    'il',
    'in',
    'it',
    'jp',
    'kr',
    'lt',
    'lv',
    'ma',
    'mx',
    'my',
    'ng',
    'nl',
    'no',
    'nz',
    'ph',
    'pl',
    'pt',
    'ro',
    'rs',
    'ru',
    'sa',
    'se',
    'sg',
    'si',
    'sk',
    'th',
    'tr',
    'tw',
    'ua',
    'us',
    've',
    'za',
  ];
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
      // console.error(error);
      return { apiKey: '' };
    }
  }

  async deleteAPIKey() {
    this.db.deleteAPI();
  }

  getCountriesData(): string {
    let countryString: string = '';
    this.countryList.forEach((s) => {
      countryString = countryString + s + ';';
    });
    return countryString;
  }

  async saveCountriesToDB(countries: [{}]) {
    await this.db.saveCountries(countries);
  }
  async getCountriesFromDB() {
    try {
      let result = await this.db.getCountries();
      this.countryListData = await result;
      //Remove db PK
      delete result['id'];
      return result;
    } catch (error) {
      console.log(error);
    }
  }

  // getHeadlines(countryCode: string) {
  //   let results;
  //   this.http.getHeadLines(countryCode, this.apiKey).subscribe((result) => {
  //     console.log(result);
  //     results = result['articles'];
  //   });
  //   return results;
  // }

  async getHeadlines(countryCode: string) {
    await this.getAPIKey();

    let headlineDB = await this.db.getHeadlines(countryCode);
    console.log(headlineDB);
    if (headlineDB) {
      console.log('return cache');

      let time = Date.now();
      let cachedTime = Date.parse(headlineDB['timestamp']);
      let timeDiff = (time - cachedTime) / 1000 / 60;
      if (timeDiff >= 1) {
        let payload;
        console.log('Time greater than 5 minute!');
        payload = await this.headlineAPICall(countryCode);
        await this.db.updateCache(countryCode, payload);
        return await this.db.getHeadlines(countryCode);
      }
      return headlineDB;
    } else {
      let payload;
      console.log('here');
      payload = await this.headlineAPICall(countryCode);
      console.log(payload);
      await this.db.saveHeadlines(payload);
      return await this.db.getHeadlines(countryCode);
    }
  }

  async headlineAPICall(countryCode: string) {
    let results = await this.http.getHeadLines(countryCode, this.apiKey);

    results['timestamp'] = new Date();
    results['code'] = countryCode;
    return results;
  }

  async saveArticle(countryCode: string, article: {}) {
    let results = await this.db.getHeadlines(countryCode);
    let originalArticle = results['articles'];
    let savedArticle = results['savedArticle'];
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
      originalArticle.splice(articleIndex, 1);

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
