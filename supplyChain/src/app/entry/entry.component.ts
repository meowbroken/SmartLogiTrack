import { Component } from '@angular/core';
import { FormControl, Validators, FormGroup } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-entry',
  standalone: false,
  templateUrl: './entry.component.html',
  styleUrls: ['./entry.component.css']
})
export class EntryComponent {
  loginForm!: FormGroup;
  errorMessage: string = '';

  private loginUrl = 'http://127.0.0.1:8000/api/login/';

  constructor(private http: HttpClient, private router: Router, private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.loginForm = new FormGroup({
      username: new FormControl('', Validators.required),
      password: new FormControl('', Validators.required)
    });
  }

  logOnSubmit(): void {
    if (this.loginForm.invalid) return;

    const credentials = {
      username: this.loginForm.value.username,
      password: this.loginForm.value.password
    };

    this.http.post<{ token: string; role: string }>(this.loginUrl, credentials).subscribe({
      next: (response) => {
        localStorage.setItem('authToken', response.token);
        localStorage.setItem('role', response.role);

        // Show success snackbar
        this.snackBar.open('Login successful!', 'Close', {
          duration: 3000,
          panelClass: ['success-snackbar'],
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });

        if (response.role.toLowerCase() === 'admin') {
          this.router.navigate(['/dashboard']);
        } else {
          this.router.navigate(['/dashboard']);
        }
      },
      error: (err) => {
        console.error('Login failed:', err);

        // Show error snackbar
        this.snackBar.open('Login failed. Please check your credentials and try again.', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }
}