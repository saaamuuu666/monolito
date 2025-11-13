import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class RestApiServiceService {
  public url: string = 'http://localhost:3007';
  constructor(private http: HttpClient) {}

  getPosts(): Observable<any> {
    return this.http.get(this.url + '/posts');
  }
}