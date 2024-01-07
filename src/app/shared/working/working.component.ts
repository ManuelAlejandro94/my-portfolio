import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { locale as english } from '../../services/i18n/en';
import { locale as spanish } from '../../services/i18n/es';
import { TranslationLoaderService } from '../../services/translation-loader.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-working',
  templateUrl: './working.component.html',
  styleUrl: './working.component.css'
})
export class WorkingComponent implements OnInit {
  language:any="";
  count:number=5;

  constructor(private _translationLoaderService: TranslationLoaderService,
              private _translateService: TranslateService,
              private _router: Router){
    this._translationLoaderService.loadTranslations(english, spanish);

    if (sessionStorage.getItem("lang")) {
      this.language=sessionStorage.getItem("lang");
    }
    else{
      this.language='en';
    }
    sessionStorage.setItem("lang", this.language);
    this._translateService.setDefaultLang(this.language);
    this._translateService.use(this.language);
  }

  ngOnInit(): void {
    const time= setInterval(() => {
      this.count-=1;

      if(this.count==0){
        clearInterval(time);
        this._router.navigate(['home']);
      }
    }, 1000);
  }
}
