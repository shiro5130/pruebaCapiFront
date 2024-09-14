import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ApiService {
    private itemSource = new BehaviorSubject<any[]>([]);
    items$ = this.itemSource.asObservable();

    private apiUrl = 'http://pruebacapi.test/api/contacts'; // URL del endpoint

    constructor(private http: HttpClient) { }

    // Obtener datos con paginación
    getData(page: number = 1): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}?page=${page}`);
    }
    getDatafilter(page: number = 1, palabra: string): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}?page=${page}&name=` + palabra);
    }

    // Crear nuevo contacto
    createData(body: {}): Observable<any> {
        return this.http.post<any>(this.apiUrl, body);
    }

    // Editar contacto existente
    editData(body: any): Observable<any> {
        console.log(body);
        return this.http.put<any>(`${this.apiUrl}/${body.id}`, body);
    }

    // Eliminar contacto por ID
    deleteData(id: number): Observable<any> {
        return this.http.delete<any>(`${this.apiUrl}/${id}`);
    }
}
