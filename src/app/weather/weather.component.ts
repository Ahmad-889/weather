import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { WeatherService } from '../services/weather.service';

@Component({
  selector: 'app-weather',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './weather.component.html',
  styleUrl: './weather.component.scss',
})
export class WeatherComponent {
  weatherForm: FormGroup;
  weatherData: any = null;
  temperatureEmoji: string | null = null;
  humidityEmoji: string | null = null;
  descriptionEmoji: string | null = null;
  isLoading = false;
  errorMessage: string | null = null;
  backgroundClass = 'default-bg';

  constructor(private fb: FormBuilder, private weatherService: WeatherService) {
    this.weatherForm = this.fb.group({ city: [''] });
  }

  getTemperatureEmoji(temp: number): string {
    if (temp <= 0) return '❄️';
    if (temp > 0 && temp <= 10) return '🌬️';
    if (temp > 10 && temp <= 20) return '🌤️';
    if (temp > 20 && temp <= 30) return '☀️';
    return '🔥';
  }

  getHumidityEmoji(humidity: number): string {
    if (humidity < 30) return '🌵';
    if (humidity >= 30 && humidity <= 60) return '☁️';
    return '💧';
  }

  getDescriptionEmoji(description: string): string {
    const emojiMap: { [key: string]: string } = {
      'clear sky': '☀️',
      'few clouds': '🌤️',
      'scattered clouds': '⛅',
      'broken clouds': '🌥️',
      'overcast clouds': '☁️',
      'light rain': '🌦️',
      'moderate rain': '🌧️',
      'heavy intensity rain': '🌧️💦',
      thunderstorm: '⛈️',
      snow: '❄️',
      mist: '🌫️',
    };

    return emojiMap[description] || '❓';
  }

  fetchWeather() {
    this.errorMessage = null;
    this.isLoading = true;
    const city = this.weatherForm.value.city;

    if (!city.trim()) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          this.weatherService.getWeatherByCoords(latitude, longitude).subscribe({
            next: (data) => this.updateWeather(data),
            error: () => {
              this.errorMessage = 'Unable to fetch location weather.';
              this.isLoading = false;
            }
          });
        },
        () => {
          this.errorMessage = 'Location permission denied.';
          this.isLoading = false;
        }
      );
      return;
    }


    this.weatherService.getWeather(city).subscribe({
      next: (data) => {
        this.weatherData = data;
        this.temperatureEmoji = this.getTemperatureEmoji(data.main.temp);
        this.humidityEmoji = this.getHumidityEmoji(data.main.humidity);
        this.descriptionEmoji = this.getDescriptionEmoji(
          data.weather[0].description
        );
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'City not found.';
        this.isLoading = false;
      },
    });
  }

  private updateWeather(data: any) {
    this.weatherData = data;
    this.temperatureEmoji = this.getTemperatureEmoji(data.main.temp);
    this.humidityEmoji = this.getHumidityEmoji(data.main.humidity);
    this.descriptionEmoji = this.getDescriptionEmoji(
      data.weather[0].description
    );
    this.isLoading = false;
  }

}
