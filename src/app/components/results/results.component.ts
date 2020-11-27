import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ActivatedRouteSnapshot } from '@angular/router';
import { DatabaseService } from 'src/app/services/database.service';
import { NewsService } from 'src/app/services/news.service';

@Component({
  selector: 'app-results',
  templateUrl: './results.component.html',
  styleUrls: ['./results.component.css'],
})
export class ResultsComponent implements OnInit {
  countryID: string;
  headlines: [{}];
  savedArticles: [{}];
  constructor(
    private newsService: NewsService,
    private activatedRoute: ActivatedRoute,
    private db: DatabaseService
  ) {}

  ngOnInit(): void {
    this.countryID = this.activatedRoute.snapshot.params['code'];

    this.getNews();
  }

  async getNews() {
    let results = await this.newsService.getHeadlines(this.countryID);
    console.log(results);
    this.headlines = results['articles'];
    this.savedArticles = results['savedArticle'];
  }

  async saveArticle(article: {}) {
    await this.newsService.saveArticle(this.countryID, article);
    await this.getNews();
  }

  async deleteArticle(article: {}) {
    await this.newsService.deleteArticle(this.countryID, article);
    await this.getNews();
  }
}
