import {
  HttpClient,
  HttpHeaderResponse,
  HttpHeaders,
  HttpParams,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { COUNTRIES } from '../model/model';

@Injectable({
  providedIn: 'root',
})
export class HttpService {
  constructor(private http: HttpClient) {}

  getCountriesData() {
    let countryUrl = 'https://restcountries.eu/rest/v2/alpha';
    let params = new HttpParams();
    params = params.set('codes', COUNTRIES);
    return this.http.get<[{}]>(countryUrl, { params: params });
  }

  async getHeadLines(countryCode: string, apiKey: string) {
    let newsUrl = 'https://newsapi.org/v2/top-headlines';
    let params = new HttpParams();
    params = params.set('country', countryCode);
    params = params.set('category', 'general');
    params = params.set('pageSize', '5');
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
