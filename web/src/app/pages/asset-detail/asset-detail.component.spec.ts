import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { AssetDetailComponent } from './asset-detail.component';
import { Asset, AssetSummary, Telemetry, TelemetryResult } from '../../models/windops.models';

const mockAsset: Asset = {
  id: 'WT-001',
  name: 'Aerogerador 01',
  type: 'WIND_TURBINE',
  status: 'ONLINE',
  ratedPowerMw: 3.2,
  location: 'Parque Demo A',
};

const mockSummary: AssetSummary = {
  assetId: 'WT-001',
  samples: 1,
  averagePowerMw: 2.7,
  maxTemperatureC: 90,
  warningAlerts: 0,
  criticalAlerts: 1,
};

const mockTelemetry: Telemetry[] = [
  {
    id: 1,
    assetId: 'WT-001',
    powerMw: 2.7,
    windSpeedMs: 11.4,
    temperatureC: 90,
    timestamp: '2026-09-15T12:00:00.000Z',
  },
];

const mockResult: TelemetryResult = {
  id: 2,
  assetId: 'WT-001',
  powerMw: 3.0,
  windSpeedMs: 12.1,
  temperatureC: 90,
  timestamp: '2026-09-18T12:00:00.000Z',
  severity: 'CRITICAL',
  alert: {
    id: 'AL-001',
    assetId: 'WT-001',
    severity: 'CRITICAL',
    type: 'HIGH_TEMPERATURE',
    message: 'Temperatura em nível crítico.',
    timestamp: '2026-09-18T12:00:00.000Z',
  },
};

describe('AssetDetailComponent', () => {
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssetDetailComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: { get: () => 'WT-001' } } },
        },
      ],
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  function flushInitialLoad() {
    httpMock.expectOne('http://localhost:3000/assets/WT-001').flush(mockAsset);
    httpMock.expectOne('http://localhost:3000/assets/WT-001/summary').flush(mockSummary);
    httpMock.expectOne('http://localhost:3000/assets/WT-001/telemetry').flush(mockTelemetry);
  }

  it('deve carregar asset, summary e telemetria em paralelo e renderizar', () => {
    const fixture = TestBed.createComponent(AssetDetailComponent);
    const component = fixture.componentInstance;

    fixture.detectChanges();
    expect(component.assetId()).toBe('WT-001');
    expect(component.loading()).toBe(true);

    flushInitialLoad();
    fixture.detectChanges();

    expect(component.loading()).toBe(false);
    expect(component.asset()?.name).toBe('Aerogerador 01');
    expect(component.summary()?.maxTemperatureC).toBe(90);
    expect(component.telemetry().length).toBe(1);

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Aerogerador 01');
    expect(el.textContent).toContain('Nova Leitura de Telemetria');
  });

  it('deve enviar POST e refletir sucesso com alerta CRITICAL', () => {
    const fixture = TestBed.createComponent(AssetDetailComponent);
    const component = fixture.componentInstance;

    fixture.detectChanges();
    flushInitialLoad();
    fixture.detectChanges();

    component.formTemperatureC = 90;
    component.formPowerMw = 3.0;
    component.onSubmitTelemetry();

    const post = httpMock.expectOne('http://localhost:3000/assets/WT-001/telemetry');
    expect(post.request.method).toBe('POST');
    expect(post.request.body.temperatureC).toBe(90);
    post.flush(mockResult);

    fixture.detectChanges();
    expect(component.submitting()).toBe(false);
    expect(component.formSuccessMessage()).toContain('CRITICAL');
    expect(component.lastAlertCreated()).toContain('Alerta Gerado');

    // Após o POST, summary e telemetria são recarregados
    httpMock.expectOne('http://localhost:3000/assets/WT-001/summary').flush(mockSummary);
    httpMock.expectOne('http://localhost:3000/assets/WT-001/telemetry').flush(mockTelemetry);

    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.success-banner')).toBeTruthy();
    expect(el.textContent).toContain('Leitura registrada com sucesso');
  });

  it('deve mostrar mensagem de validação quando a API rejeitar com 400', () => {
    const fixture = TestBed.createComponent(AssetDetailComponent);
    const component = fixture.componentInstance;

    fixture.detectChanges();
    flushInitialLoad();
    fixture.detectChanges();

    component.formTemperatureC = -5;
    component.onSubmitTelemetry();

    const post = httpMock.expectOne('http://localhost:3000/assets/WT-001/telemetry');
    post.flush(
      { message: ['temperatureC must not be less than 0'] },
      { status: 400, statusText: 'Bad Request' },
    );

    fixture.detectChanges();
    expect(component.formErrorMessage()).toContain('Validação rejeitada pela API');

    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.error-banner')).toBeTruthy();
  });

  it('deve exibir estado "não encontrado" quando o ativo não existir (404)', () => {
    const fixture = TestBed.createComponent(AssetDetailComponent);
    const component = fixture.componentInstance;

    fixture.detectChanges();
    httpMock
      .expectOne('http://localhost:3000/assets/WT-001')
      .flush({ message: 'Asset WT-001 not found' }, { status: 404, statusText: 'Not Found' });

    fixture.detectChanges();
    expect(component.notFound()).toBe(true);
    expect(component.loading()).toBe(false);

    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.not-found-state')).toBeTruthy();
    expect(el.textContent).toContain('Ativo Não Encontrado');
  });

  it('deve marcar o ativo como OFFLINE via PATCH e atualizar a UI', () => {
    const fixture = TestBed.createComponent(AssetDetailComponent);
    const component = fixture.componentInstance;

    fixture.detectChanges();
    flushInitialLoad();
    fixture.detectChanges();

    component.onToggleOffline();

    const patch = httpMock.expectOne('http://localhost:3000/assets/WT-001/status');
    expect(patch.request.method).toBe('PATCH');
    expect(patch.request.body).toEqual({ status: 'OFFLINE' });
    patch.flush({ ...mockAsset, status: 'OFFLINE' });

    fixture.detectChanges();
    expect(component.asset()?.status).toBe('OFFLINE');
    expect(component.statusFeedback()?.type).toBe('success');

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Ativo marcado como OFFLINE');
    expect(el.textContent).toContain('Reativar (Online)');
  });

  it('deve reativar o ativo (ONLINE) quando ele estiver OFFLINE', () => {
    const fixture = TestBed.createComponent(AssetDetailComponent);
    const component = fixture.componentInstance;

    fixture.detectChanges();
    httpMock
      .expectOne('http://localhost:3000/assets/WT-001')
      .flush({ ...mockAsset, status: 'OFFLINE' });
    httpMock.expectOne('http://localhost:3000/assets/WT-001/summary').flush(mockSummary);
    httpMock.expectOne('http://localhost:3000/assets/WT-001/telemetry').flush(mockTelemetry);
    fixture.detectChanges();

    component.onToggleOffline();

    const patch = httpMock.expectOne('http://localhost:3000/assets/WT-001/status');
    expect(patch.request.body).toEqual({ status: 'ONLINE' });
    patch.flush({ ...mockAsset, status: 'ONLINE' });

    fixture.detectChanges();
    expect(component.asset()?.status).toBe('ONLINE');
    expect(component.statusFeedback()?.message).toContain('reativado');
  });

  it('deve exibir erro se a mudança de status falhar', () => {
    const fixture = TestBed.createComponent(AssetDetailComponent);
    const component = fixture.componentInstance;

    fixture.detectChanges();
    flushInitialLoad();
    fixture.detectChanges();

    component.onToggleOffline();

    const patch = httpMock.expectOne('http://localhost:3000/assets/WT-001/status');
    patch.flush(
      { message: 'internal error' },
      { status: 500, statusText: 'Internal Server Error' },
    );

    fixture.detectChanges();
    expect(component.statusFeedback()?.type).toBe('error');

    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.status-feedback.error')).toBeTruthy();
  });
});