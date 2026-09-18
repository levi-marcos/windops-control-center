import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Alert,
  Asset,
  AssetSummary,
  CreateTelemetryDto,
  DashboardOverview,
  HealthResponse,
  Telemetry,
  TelemetryResult,
} from '../models/windops.models';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class WindOpsApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;

  /**
   * Verifica a disponibilidade da API NestJS
   * GET /health -> { status: "ok" }
   */
  checkHealth(): Observable<HealthResponse> {
    return this.http.get<HealthResponse>(`${this.baseUrl}/health`);
  }

  /**
   * Lista ativos com filtros opcionais
   * GET /assets?status=...&type=...
   */
  getAssets(status?: string, type?: string): Observable<Asset[]> {
    let params = new HttpParams();
    if (status) {
      params = params.set('status', status);
    }
    if (type) {
      params = params.set('type', type);
    }
    return this.http.get<Asset[]>(`${this.baseUrl}/assets`, { params });
  }

  /**
   * Busca um ativo específico por ID
   * GET /assets/:id
   */
  getAsset(id: string): Observable<Asset> {
    return this.http.get<Asset>(`${this.baseUrl}/assets/${id}`);
  }

  /**
   * Busca as leituras de telemetria de um ativo
   * GET /assets/:id/telemetry
   */
  getTelemetry(id: string): Observable<Telemetry[]> {
    return this.http.get<Telemetry[]>(`${this.baseUrl}/assets/${id}/telemetry`);
  }

  /**
   * Busca o resumo operacional de um ativo
   * GET /assets/:id/summary
   */
  getSummary(id: string): Observable<AssetSummary> {
    return this.http.get<AssetSummary>(`${this.baseUrl}/assets/${id}/summary`);
  }

  /**
   * Registra uma nova leitura de telemetria
   * POST /assets/:id/telemetry
   */
  createTelemetry(id: string, dto: CreateTelemetryDto): Observable<TelemetryResult> {
    return this.http.post<TelemetryResult>(`${this.baseUrl}/assets/${id}/telemetry`, dto);
  }

  /**
   * Busca os KPIs agregados para o dashboard
   * GET /dashboard/overview
   */
  getDashboardOverview(): Observable<DashboardOverview> {
    return this.http.get<DashboardOverview>(`${this.baseUrl}/dashboard/overview`);
  }

  /**
   * Lista alertas
   * GET /alerts
   */
  getAlerts(): Observable<Alert[]> {
    return this.http.get<Alert[]>(`${this.baseUrl}/alerts`);
  }
}


