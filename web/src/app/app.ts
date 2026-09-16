import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { WindOpsApiService } from './services/windops-api.service';

export type ApiHealthState = 'loading' | 'online' | 'offline';

@Component({
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App implements OnInit {
  private readonly apiService = inject(WindOpsApiService);

  /**
   * Estado da conexão com o backend:
   * 'loading' | 'online' | 'offline'
   */
  readonly apiState = signal<ApiHealthState>('loading');
  readonly errorMessage = signal<string | null>(null);

  ngOnInit(): void {
    this.checkHealth();
  }

  checkHealth(): void {
    this.apiState.set('loading');
    this.errorMessage.set(null);

    this.apiService.checkHealth().subscribe({
      next: (res) => {
        if (res.status === 'ok') {
          this.apiState.set('online');
        } else {
          this.apiState.set('offline');
          this.errorMessage.set(`Resposta inesperada: ${res.status}`);
        }
      },
      error: (err) => {
        this.apiState.set('offline');
        this.errorMessage.set('Falha na comunicação com o backend NestJS.');
        console.error('Erro ao verificar saúde da API:', err);
      },
    });
  }
}

