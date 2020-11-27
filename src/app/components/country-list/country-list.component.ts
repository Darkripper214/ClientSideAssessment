import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpService } from 'src/app/services/http.service';
import { NewsService } from 'src/app/services/news.service';

@Component({
  selector: 'app-country-list',
  templateUrl: './country-list.component.html',
  styleUrls: ['./country-list.component.css'],
})
export class CountryListComponent implements OnInit {
  countryList: [{}];
  constructor(
    private newsService: NewsService,
    private http: HttpService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.checkAPIKey();
  }

  country() {
    return this.newsService.getCountriesData();
  }

  async getCountryList() {
    let DBData = await this.newsService.getCountriesFromDB();
    if (DBData) {
      console.log('getting from DB!');
      this.countryList = DBData;
      console.log(this.countryList);
    } else {
      console.log('getting from API!!');
      this.http.getCountriesData(this.country()).subscribe((results) => {
        this.countryList = results;
        this.newsService.saveCountriesToDB(this.countryList);
      });
    }
  }

  async checkAPIKey() {
    let result = await this.newsService.getAPIKey();

    if (result['apiKey']) {
      this.getCountryList();
    } else {
      window.alert('No API Key detected, redirecting to setting page');

      this.router.navigate(['/setting']);
    }
  }
}
