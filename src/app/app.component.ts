import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { WorkingComponent } from './shared/working/working.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  isShow=true;

  constructor(private _translateService: TranslateService){
    this._translateService.addLangs(['en', 'es']);
    this._translateService.setDefaultLang('es');
  }

  ngOnInit(): void {
    if (!sessionStorage.getItem("lang")) {
      sessionStorage.setItem("lang", 'en');
    }
    let lang:any=sessionStorage.getItem("lang"); 
    this._translateService.setDefaultLang(lang);
    this._translateService.use(lang);
  }

  showHide(event: any){
    this.isShow = !(event instanceof WorkingComponent);
  }
}
