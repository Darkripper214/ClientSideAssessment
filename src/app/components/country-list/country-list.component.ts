import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Country } from 'src/app/model/model';
import { HttpService } from 'src/app/services/http.service';
import { NewsService } from 'src/app/services/news.service';

@Component({
  selector: 'app-country-list',
  templateUrl: './country-list.component.html',
  styleUrls: ['./country-list.component.css'],
})
export class CountryListComponent implements OnInit {
  countryList: Country[];
  constructor(
    private newsService: NewsService,
    private http: HttpService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.checkAPIKey();
  }

  async getCountryList() {
    // Get Country List either from DB or API
    this.countryList = await this.newsService.countryListInit();
  }

  async checkAPIKey() {
    // Check if API Key available
    let result = await this.newsService.getAPIKey();

    if (result['apiKey']) {
      // Get List of Country
      this.getCountryList();
    } else {
      // Redirect to Setting Page
      window.alert('No API Key detected, redirecting to setting page');

      this.router.navigate(['/setting']);
    }
  }
}
