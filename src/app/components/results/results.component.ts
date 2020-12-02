import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { MatSnackBar, SimpleSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, ActivatedRouteSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { filter, map, mergeMap, retry, skip, take } from 'rxjs/operators';
import { DatabaseService } from 'src/app/services/database.service';
import { NewsService } from 'src/app/services/news.service';

@Component({
  selector: 'app-results',
  templateUrl: './results.component.html',
  styleUrls: ['./results.component.css'],
})
export class ResultsComponent implements OnInit, OnDestroy {
  countryID: string = this.activatedRoute.snapshot.params['code'];
  countryName: string;
  headlines: [{}];
  headlines$: Observable<{}>;
  savedArticles: [{}];

  constructor(
    private newsService: NewsService,
    private activatedRoute: ActivatedRoute,
    private db: DatabaseService,
    private _snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    // this.getNews();
    this.getCountryName();
    this.newsService.init(this.countryID);
    this.headlines$ = this.newsService.articlesSubject$;
  }

  ngOnDestroy(): void {
    this.newsService.clearArticle();
  }

  async saveArticle(article: {}) {
    await this.newsService.saveArticle(this.countryID, article);
    this.notification('Article Saved', 'remove');
    // await this.getNews();
  }

  async deleteArticle(article: {}) {
    await this.newsService.deleteArticle(this.countryID, article);
    this.notification('Article Removed', 'remove');
    // await this.getNews();
  }

  notification(text, action) {
    this._snackBar.open(text, action, {
      duration: 2000,
    });
  }

  async getCountryName() {
    let results = await this.db.getCountries();

    results.forEach((country) => {
      if (country['code'] === this.countryID) {
        this.countryName = country['name'];
      }
    });
  }
}
