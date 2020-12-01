import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { DatabaseService } from 'src/app/services/database.service';
import { NewsService } from 'src/app/services/news.service';

@Component({
  selector: 'app-setting',
  templateUrl: './setting.component.html',
  styleUrls: ['./setting.component.css'],
})
export class SettingComponent implements OnInit {
  constructor(
    private fb: FormBuilder,
    private newsService: NewsService,
    private router: Router,
    private _snackBar: MatSnackBar
  ) {}
  settingForm: FormGroup;
  apiKey: string;
  ngOnInit(): void {
    this.settingForm = this.fb.group({
      apiKey: ['', [Validators.required]],
    });
    // this.checkAPIKey();
    this.getAPI();
  }

  async onSubmit() {
    await this.newsService.saveAPIKey(this.settingForm.value);
    this.notification('api key saved', 'remove');
    this.router.navigate(['/countries']);
  }

  async onDelete() {
    await this.newsService.deleteAPIKey();
    this.apiKey = '';
    this.settingForm.reset();
  }

  onBack() {
    this.router.navigate(['/countries']);
  }

  async getAPI() {
    try {
      let apiKey = await this.newsService.getAPIKey();
      this.settingForm.patchValue(apiKey);
      if (apiKey['apiKey']) {
        this.apiKey = apiKey['apiKey'];
      }
    } catch (error) {
      console.error(error);
    }
  }

  notification(text, action) {
    this._snackBar.open(text, action, {
      duration: 2000,
    });
  }
}
