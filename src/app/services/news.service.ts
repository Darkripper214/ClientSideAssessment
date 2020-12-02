import { Injectable, ɵConsole } from '@angular/core';
import { stringify } from 'querystring';
import { BehaviorSubject, Observable, of, Subject, throwError } from 'rxjs';
import { apiKey, Country } from '../model/model';
import { DatabaseService } from './database.service';
import { HttpService } from './http.service';
import { fromPromise } from 'rxjs/internal-compatibility';
import {
  catchError,
  filter,
  map,
  mergeMap,
  retry,
  take,
  tap,
} from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class NewsService {
  private apiKeySubject = new BehaviorSubject<string>('');
  apiKey$: Observable<string> = this.apiKeySubject.asObservable();
  private articlesSubject = new BehaviorSubject<{}>({});
  articlesSubject$: Observable<{}> = this.articlesSubject.asObservable();

  apiKey: string;
  countryListData: Country;
  constructor(private db: DatabaseService, private http: HttpService) {}

  saveAPIKey(apiKey: apiKey) {
    const dbSaveApi$ = fromPromise(this.db.saveAPI(apiKey))
      .pipe(take(1))
      .subscribe();
    this.apiKeySubject.next(apiKey['apiKey']);
  }

  getAPIKey() {
    const dbGetApi$ = fromPromise(this.db.getApi()).pipe(
      // tap((res) => console.log(res)),
      filter((res) => res !== undefined),
      map((res) => res['apiKey']),
      catchError((err) => throwError(err)),
      take(1)
    );

    let sub = dbGetApi$.subscribe(
      (value) => {
        console.log(value);
        this.apiKeySubject.next(value);
        this.apiKeySubject.complete();
        return value;
      },
      (error) => console.log(error)
    );
  }

  deleteAPIKey() {
    this.db.deleteAPI();
    this.apiKeySubject.next('');
  }

  getCountryFromDB(): Observable<Country[]> {
    return fromPromise(this.db.getCountries()).pipe(
      map((res) => {
        if (res) {
          delete res['id'];
        }
        return res;
      })
    );
  }

  getCountryFromAPI(): Observable<any> {
    return this.http.getCountriesData().pipe(
      map((res: [{}]) => {
        let list: Country[] = [];
        res.forEach((c) => {
          list.push({
            code: c['alpha2Code'].toLowerCase(),
            name: c['name'],
            flag: c['flag'],
          } as Country);
        });
        this.db.saveCountries(list);
        console.log('saved to DB');
        return list;
      })
    );
  }

  headlineFromDB(countryCode: string): Observable<any> {
    return fromPromise(this.db.getHeadlines(countryCode));
  }

  headlineAPICall(countryCode: string, apiKey: string): Observable<{}> {
    console.log(apiKey);
    console.log(countryCode);
    return this.http.getHeadLines(countryCode, apiKey).pipe(
      map((res) => {
        res['timestamp'] = new Date();
        res['code'] = countryCode;
        return res;
      })
    );
  }

  clearArticle() {
    this.articlesSubject.next({});
  }

  async init(countryID: string) {
    // Getting api Key - Firstcase is during navigation - Secondcase for init, as api Key is completed
    let apiKey =
      this.apiKeySubject.getValue() || (await this.apiKey$.toPromise());
    console.log(this.apiKeySubject.getValue());
    console.log('here');
    console.log(apiKey);
    let headlineFromDB$ = this.headlineFromDB(countryID).pipe(
      take(1),
      mergeMap((res) => {
        if (!res) {
          // If no data in DB, call API and save as new
          console.log('im here');
          console.log(res);
          return headlineAPICall$.pipe(
            map((res) => {
              console.log('het res');
              res['savedArticle'] = [];
              this.db.saveHeadlines(res);
              return res;
            })
          );
        } else if (res['timestamp']) {
          // If data in DB, check if expired
          let cachedTime = Date.parse(res['timestamp']);
          let timeDiff = (Date.now() - cachedTime) / 1000 / 60;
          console.log(timeDiff);
          if (timeDiff >= 5) {
            // data expired, using update to preserved existing saved article
            console.log('Time greater than 5 minute!');
            return headlineAPICall$.pipe(
              map((res) => {
                this.db.updateCache(countryID, res);
                return res;
              })
            );
          }
          console.log('less than 5 min');
          return of(res);
        }
      })
    );

    let headlineAPICall$ = this.headlineAPICall(countryID, apiKey).pipe();
    console.log(headlineAPICall$);
    console.log('before subs');
    headlineFromDB$.subscribe((res) => this.articlesSubject.next(res));
  }

  async saveArticle(countryCode: string, article: {}) {
    let results = this.articlesSubject.getValue();
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

      this.headlineFromDB(countryCode).subscribe((res) =>
        this.articlesSubject.next(res)
      );
    }
  }

  async deleteArticle(countryCode: string, article: {}) {
    let results = this.articlesSubject.getValue();
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
      this.headlineFromDB(countryCode).subscribe((res) =>
        this.articlesSubject.next(res)
      );
    }
  }
}
