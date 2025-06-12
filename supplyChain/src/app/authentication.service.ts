import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  private API_URL = 'http://127.0.0.1:8000/api/';

  constructor(private http: HttpClient, private router: Router) { }

  register(userData: any): Observable<any> {
    return this.http.post(`${this.API_URL}register/`, userData).pipe(
      tap(response => {
        console.log('Registration response:', response);
      })
    );
  }

  login(credentials: any): Observable<any> {
    return this.http.post<any>(`${this.API_URL}login/`, credentials).pipe(
      tap(response => {
        console.log('Login response:', response);
        if (response?.token) {
          localStorage.setItem('authToken', response.token);
          localStorage.setItem('role', response.role || 'user');
        }
        // REMOVE this.router.navigate(['/search']);
      })
    );
  }
  logout(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('role');
    
    this.router.navigate(['/login']);
  }
}