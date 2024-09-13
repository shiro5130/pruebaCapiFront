import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ApiService {

    // private baseApiUrl = 'http://pruebacapi.test/api';
    private apiUrl = 'http://pruebacapi.test/api/contacts'; // URL del endpoint
    constructor(private http: HttpClient) { }

    getData(): Observable<any> {
        return this.http.get<any>(this.apiUrl);
    }

    createData(body: {}): Observable<any> {
        return this.http.post<any>(this.apiUrl, body);
    }
}
