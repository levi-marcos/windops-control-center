import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { WindOpsApiService } from '../../services/windops-api.service';
import { Asset } from '../../models/windops.models';

@Component({
  selector: 'app-assets-list',
  imports: [RouterLink],
  templateUrl: './assets-list.component.html',
  styleUrl: './assets-list.component.scss',
})
export class AssetsListComponent implements OnInit {
  private readonly apiService = inject(WindOpsApiService);

  readonly assets = signal<Asset[]>([]);
  readonly loading = signal<boolean>(true);
  readonly error = signal<string | null>(null);

  // Filtros opcionais
  readonly filterStatus = signal<string>('');
  readonly filterType = signal<string>('');

  ngOnInit(): void {
    this.loadAssets();
  }

  loadAssets(): void {
    this.loading.set(true);
    this.error.set(null);

    const status = this.filterStatus() || undefined;
    const type = this.filterType() || undefined;

    this.apiService.getAssets(status, type).subscribe({
      next: (data) => {
        this.assets.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Não foi possível carregar os ativos. Verifique a conexão com a API.');
        this.loading.set(false);
        console.error('Erro ao buscar ativos:', err);
      },
    });
  }

  onStatusFilter(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.filterStatus.set(value);
    this.loadAssets();
  }

  onTypeFilter(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.filterType.set(value);
    this.loadAssets();
  }
}
