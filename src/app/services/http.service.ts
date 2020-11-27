import {
  HttpClient,
  HttpHeaderResponse,
  HttpHeaders,
  HttpParams,
} from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class HttpService {
  constructor(private http: HttpClient) {}

  getCountriesData(countryList: string) {
    let countryUrl = 'https://restcountries.eu/rest/v2/alpha';
    let params = new HttpParams();
    params = params.set('codes', countryList);
    return this.http.get<[{}]>(countryUrl, { params: params });
  }

  async getHeadLines(countryCode: string, apiKey: string) {
    let newsUrl = 'https://newsapi.org/v2/top-headlines';
    let params = new HttpParams();
    params = params.set('country', countryCode);
    params = params.set('category', 'general');
    params = params.set('pageSize', '30');
    // let headers = new HttpHeaders({
    //   'Content-Type': 'application/json',
    //   'X-Api-Key': apiKey,
    // });
    let results = await this.http
      .get<{}>(newsUrl, {
        params: params,
        headers: {
          'X-Api-Key': apiKey,
        },
      })
      .toPromise();
    return results;
  }
}
