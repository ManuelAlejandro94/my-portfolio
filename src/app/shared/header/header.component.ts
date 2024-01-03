import { Component, OnInit } from '@angular/core';
import { TranslationLoaderService } from '../../services/translation-loader.service';
import { TranslateService } from '@ngx-translate/core';
import { locale as english } from '../../services/i18n/en';
import { locale as spanish } from '../../services/i18n/es';
import $ from 'jquery';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit {
  language:any="";

  constructor(private _translationLoaderService: TranslationLoaderService,
              private _translateService: TranslateService){
    this._translationLoaderService.loadTranslations(english, spanish);

    if (localStorage.getItem("lang")) {
      this.language=localStorage.getItem("lang");
    } else {
      this.language='es';
    }
  }

  languageChange($event:any){
    let lang=$event.value;
    localStorage.setItem("lang", lang);
    this._translateService.setDefaultLang(lang);
    this._translateService.use(lang);
  }

  ngOnInit(): void {
    $('.js-scroll-trigger').on('click',
      function (): void {
        $('.navbar-collapse').toggle();
      }
    );
    $('.nav').on('click',
      function (): void {
        $('.navbar-collapse').toggle();
      }
    );
  }
}
