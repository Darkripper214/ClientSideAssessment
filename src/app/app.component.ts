import { Component, OnInit } from '@angular/core';
import { NewsService } from './services/news.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  title = 'day20';
  constructor(private newsService: NewsService) {}

  ngOnInit() {
    // Initialize and get the api key
    this.newsService.getAPIKey();
  }
}
