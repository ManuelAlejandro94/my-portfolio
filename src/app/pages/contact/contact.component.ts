import { Component, OnInit } from '@angular/core';
import { ContactService } from '../../services/contact.service';
import { ContactInterface } from '../../interfaces/contact.interface';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { ContactValidation } from '../../validations/contact-validation.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.css'
})
export class ContactComponent implements OnInit {

  contactModel: ContactInterface = {};
  //contactForm!: FormGroup;
  response: any = "";
  loading = false;

  constructor (private _contactService: ContactService,
                private _router: Router){}

  ngOnInit(): void {
  }

  contact(){
    this.loading = true;
    this.contactModel.lang = sessionStorage.getItem("lang")?.toString();
    console.log(this.contactModel);
    
    this._contactService.apiRequest(this.contactModel)
      .subscribe( (resp: any) => {
        this.response = resp;
        console.log(this.response);
        this.loading = false;
        this._router.navigate(['home']);
      });
  }

}
