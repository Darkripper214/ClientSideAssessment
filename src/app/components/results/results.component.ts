import { Component, OnInit } from '@angular/core';
import { MatSnackBar, SimpleSnackBar } from '@angular/material/snack-bar';
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
    private db: DatabaseService,
    private _snackBar: MatSnackBar
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
    this.notification('Article Saved', 'remove');
    await this.getNews();
  }

  async deleteArticle(article: {}) {
    await this.newsService.deleteArticle(this.countryID, article);
    this.notification('Article Removed', 'remove');
    await this.getNews();
  }

  notification(text, action) {
    this._snackBar.open(text, action, {
      duration: 2000,
    });
  }
}
