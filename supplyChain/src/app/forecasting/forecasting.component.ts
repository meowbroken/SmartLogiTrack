import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

interface Forecast {
  product: string;
  date: string;
  predicted: number;
  lower: number;
  upper: number;
}

@Component({
  selector: 'app-forecast',
  standalone: false,
  templateUrl: './forecasting.component.html',
  styleUrls: ['./forecasting.component.css']
})
export class ForecastingComponent implements OnInit {
  // Typed forecasts array; each forecast has a product name, forecast date, and prediction range.
  forecasts: Forecast[] = [];
  errorMessage: string = '';
  isLoading: boolean = false;

  // Ensure the forecast URL matches the backend endpoint.
  private forecastUrl = 'http://127.0.0.1:8000/forecast/predict/';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.getForecastData();
  }

  // Fetch forecast data from your backend.
  getForecastData(): void {
    this.isLoading = true;
    this.http.get<Forecast[]>(this.forecastUrl).subscribe({
      next: (data: Forecast[]) => {
        this.forecasts = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching forecast data:', err);
        this.errorMessage = 'Failed to load forecast data. Please try again later.';
        this.isLoading = false;
      }
    });
  }
}