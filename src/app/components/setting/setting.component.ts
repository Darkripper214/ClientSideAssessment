import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
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
    private router: Router
  ) {}
  settingForm: FormGroup;
  apiKey: string;
  ngOnInit(): void {
    this.settingForm = this.fb.group({
      apiKey: ['', [Validators.required]],
    });
    this.checkAPIKey();
    this.getAPI();
  }

  async onSubmit() {
    await this.newsService.saveAPIKey(this.settingForm.value);
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
    } catch (error) {
      console.error(error);
    }
  }

  async checkAPIKey() {
    let result = await this.newsService.getAPIKey();
    if (result['apiKey']) {
      this.apiKey = result['apiKey'];
    }
  }
}
