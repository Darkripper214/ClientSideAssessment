import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { DatabaseService } from 'src/app/services/database.service';
import { NewsService } from 'src/app/services/news.service';

@Component({
  selector: 'app-setting',
  templateUrl: './setting.component.html',
  styleUrls: ['./setting.component.css'],
})
export class SettingComponent implements OnInit, OnDestroy {
  constructor(
    private fb: FormBuilder,
    private newsService: NewsService,
    private router: Router,
    private _snackBar: MatSnackBar
  ) {}
  settingForm: FormGroup;
  apiKeySub: Subscription;
  apiKey: string;
  ngOnInit(): void {
    this.settingForm = this.fb.group({
      apiKey: ['', [Validators.required]],
    });
    // this.checkAPIKey();
    // this.getAPI();
    this.apiKeySub = this.newsService.apiKey$.subscribe((apiKey) => {
      // console.log(apiKey);
      this.apiKey = apiKey;
      this.settingForm.patchValue({ apiKey });
    });
  }

  ngOnDestroy(): void {
    this.apiKeySub.unsubscribe();
  }

  onSubmit() {
    this.newsService.saveAPIKey(this.settingForm.value);
    this.notification('api key saved', 'remove');
    this.router.navigate(['/countries']);
  }

  onDelete() {
    this.newsService.deleteAPIKey();
    this.settingForm.reset();
    console.log(this.apiKey);
  }

  onBack() {
    this.router.navigate(['/countries']);
  }

  // async getAPI() {
  //   try {
  //     let apiKey = await this.newsService.getAPIKey();
  //     this.settingForm.patchValue(apiKey);
  //     if (apiKey['apiKey']) {
  //       this.apiKey = apiKey['apiKey'];
  //     }
  //   } catch (error) {
  //     console.error(error);
  //   }
  // }

  notification(text, action) {
    this._snackBar.open(text, action, {
      duration: 2000,
    });
  }
}
