import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, Subscription, of } from 'rxjs';
import { mergeMap, skip, take, tap } from 'rxjs/operators';
import { Country } from 'src/app/model/model';
import { NewsService } from 'src/app/services/news.service';

@Component({
  selector: 'app-country-list',
  templateUrl: './country-list.component.html',
  styleUrls: ['./country-list.component.css'],
})
export class CountryListComponent implements OnInit, OnDestroy {
  countryList$: Observable<Country[]>;
  apiKeySub: Subscription;
  constructor(private newsService: NewsService, private router: Router) {}

  ngOnInit(): void {
    // this.checkAPIKey();
    this.newsService.getAPIKey();
    this.countryList$ = this.countryFromDB$;
    this.apiKeySub = this.newsService.apiKey$
      // skip1 to avoid taking the default value of behaviorSubject
      .pipe(skip(1))
      .subscribe((apiKey) => {
        // Check if API Key available
        if (!apiKey.length) {
          // Redirect to Setting Page
          window.alert('No API Key detected, redirecting to setting page');
          this.router.navigate(['/setting']);
        }
      });
  }

  ngOnDestroy(): void {
    this.apiKeySub.unsubscribe();
  }

  countryFromAPI$ = this.newsService.getCountryFromAPI().pipe(
    take(1),
    tap(() => console.log('From API'))
  );

  countryFromDB$ = this.newsService.getCountryFromDB().pipe(
    take(1),
    mergeMap((res) => {
      // If no contry info in DB, call API
      if (!res) {
        console.log(res);
        return this.countryFromAPI$;
      } else return of(res);
    }),
    tap((res) => console.log(res))
  );
}
