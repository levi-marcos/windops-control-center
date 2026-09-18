import { Component, OnInit, inject, signal } from '@angular/core';
import { SlicePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { WindOpsApiService } from '../../services/windops-api.service';
import { Asset, AssetSummary, Telemetry, TelemetryResult } from '../../models/windops.models';

@Component({
  selector: 'app-asset-detail',
  imports: [RouterLink, FormsModule, SlicePipe],
  templateUrl: './asset-detail.component.html',
  styleUrl: './asset-detail.component.scss',
})
export class AssetDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly apiService = inject(WindOpsApiService);

  readonly assetId = signal<string>('');
  readonly asset = signal<Asset | null>(null);
  readonly summary = signal<AssetSummary | null>(null);
  readonly telemetry = signal<Telemetry[]>([]);

  // Estados assíncronos da página
  readonly loading = signal<boolean>(true);
  readonly error = signal<string | null>(null);
  readonly notFound = signal<boolean>(false);

  // Estados do formulário de telemetria
  readonly submitting = signal<boolean>(false);
  readonly formSuccessMessage = signal<string | null>(null);
  readonly formErrorMessage = signal<string | null>(null);
  readonly lastAlertCreated = signal<string | null>(null);

  // Campos do formulário
  formPowerMw: number = 2.8;
  formWindSpeedMs: number | null = 10.5;
  formTemperatureC: number = 75;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.assetId.set(id);
      this.loadAllData(id);
    } else {
      this.notFound.set(true);
      this.loading.set(false);
    }
  }

  loadAllData(id: string): void {
    this.loading.set(true);
    this.error.set(null);
    this.notFound.set(false);

    // Primeiro confirma que o ativo existe, antes de disparar summary/telemetria.
    // Evita requests órfãs quando o ativo não existe (404).
    this.apiService.getAsset(id).subscribe({
      next: (asset) => {
        this.asset.set(asset);
        this.loadAssetDetails(id);
      },
      error: (err) => {
        this.loading.set(false);
        if (err.status === 404) {
          this.notFound.set(true);
        } else {
          this.error.set('Não foi possível carregar o ativo.');
          console.error('Erro ao buscar ativo:', err);
        }
      },
    });
  }

  private loadAssetDetails(id: string): void {
    // forkJoin: dispara summary e telemetria em paralelo após o asset confirmado
    forkJoin({
      summary: this.apiService.getSummary(id),
      telemetry: this.apiService.getTelemetry(id),
    }).subscribe({
      next: (res) => {
        this.summary.set(res.summary);
        this.telemetry.set(res.telemetry);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set('Não foi possível carregar os dados completos do ativo.');
        console.error('Erro no carregamento paralelo:', err);
      },
    });
  }

  onSubmitTelemetry(): void {
    this.submitting.set(true);
    this.formSuccessMessage.set(null);
    this.formErrorMessage.set(null);
    this.lastAlertCreated.set(null);

    const payload = {
      powerMw: Number(this.formPowerMw),
      windSpeedMs: this.formWindSpeedMs ? Number(this.formWindSpeedMs) : null,
      temperatureC: Number(this.formTemperatureC),
      timestamp: new Date().toISOString(),
    };

    this.apiService.createTelemetry(this.assetId(), payload).subscribe({
      next: (res: TelemetryResult) => {
        this.submitting.set(false);
        this.formSuccessMessage.set(
          `Leitura registrada com sucesso! Classificação: ${res.severity}`,
        );

        if (res.alert) {
          this.lastAlertCreated.set(
            `🚨 Alerta Gerado: [${res.alert.severity}] ${res.alert.message}`,
          );
        }

        // Recarrega summary e telemetry para atualizar a tela em tempo real
        this.refreshTelemetryAndSummary();
      },
      error: (err) => {
        this.submitting.set(false);
        if (err.status === 400) {
          this.formErrorMessage.set(
            'Validação rejeitada pela API: verifique os valores informados.',
          );
        } else if (err.status === 404) {
          this.formErrorMessage.set('Ativo não encontrado no backend.');
        } else {
          this.formErrorMessage.set(
            'Erro ao enviar telemetria. Tente novamente mais tarde.',
          );
        }
        console.error('Erro no POST de telemetria:', err);
      },
    });
  }

  private refreshTelemetryAndSummary(): void {
    const id = this.assetId();
    this.apiService.getSummary(id).subscribe((s) => this.summary.set(s));
    this.apiService.getTelemetry(id).subscribe((t) => this.telemetry.set(t));
  }
}
