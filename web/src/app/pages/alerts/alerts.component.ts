import { SlicePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { WindOpsApiService } from '../../services/windops-api.service';
import { Alert } from '../../models/windops.models';

@Component({
  selector: 'app-alerts',
  imports: [RouterLink, SlicePipe],
  templateUrl: './alerts.component.html',
  styleUrl: './alerts.component.scss',
})
export class AlertsComponent implements OnInit {
  private readonly apiService = inject(WindOpsApiService);

  readonly alerts = signal<Alert[]>([]);
  readonly loading = signal<boolean>(true);
  readonly error = signal<string | null>(null);

  ngOnInit(): void {
    this.loadAlerts();
  }

  loadAlerts(): void {
    this.loading.set(true);
    this.error.set(null);

    this.apiService.getAlerts().subscribe({
      next: (data) => {
        this.alerts.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(
          'Não foi possível carregar os alertas. Verifique a conexão com a API.',
        );
        this.loading.set(false);
        console.error('Erro ao buscar alertas:', err);
      },
    });
  }
}