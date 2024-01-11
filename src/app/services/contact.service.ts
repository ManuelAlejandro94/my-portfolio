import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ContactInterface } from '../interfaces/contact.interface';
import { Observable, catchError, throwError } from 'rxjs';
import { ApiResponse } from '../interfaces/apiresponse.interface';

@Injectable({
    providedIn: 'root'
})
export class ContactService {
    contact: ContactInterface = {};
    response: any = {};
    errorMessage: any = ""

    private readonly baseUrl = 'https://send-mail-api-p9pr.onrender.com/send-email';
    private readonly baseUrlTemplate = 'https://send-mail-api-p9pr.onrender.com/send-template-mail';

    constructor(private http:HttpClient){}

    apiRequest(data:ContactInterface): Observable<ApiResponse> {
        return this.http.post<ApiResponse>(this.baseUrlTemplate, data).
            pipe(
                catchError((err) => {
                    return throwError(err);
                })
            );
    }
}