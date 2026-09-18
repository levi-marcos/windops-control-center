import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { WindOpsApiService } from '../../services/windops-api.service';
import { DashboardOverview } from '../../models/windops.models';

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  private readonly apiService = inject(WindOpsApiService);

  readonly overview = signal<DashboardOverview | null>(null);
  readonly loading = signal<boolean>(true);
  readonly error = signal<string | null>(null);

  ngOnInit(): void {
    this.loadOverview();
  }

  loadOverview(): void {
    this.loading.set(true);
    this.error.set(null);

    this.apiService.getDashboardOverview().subscribe({
      next: (data) => {
        this.overview.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(
          'Não foi possível carregar os KPIs do dashboard. Verifique a conexão com a API.',
        );
        this.loading.set(false);
        console.error('Erro ao buscar overview:', err);
      },
    });
  }
}