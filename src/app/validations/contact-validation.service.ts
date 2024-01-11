import { Injectable } from '@angular/core';
import { ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import { FormGroup } from '@angular/forms';

export class ContactValidation {

  static fullNameValidation(control: AbstractControl): ValidationErrors | null {
    if(!control.value) return null;

    const reg = new RegExp("^[a-zA-Z]+$");
    return reg.test(control.value) ? null : { invalidSymbols: true };
  }
}
