import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { AlertsComponent } from './alerts.component';
import { Alert } from '../../models/windops.models';

const mockAlerts: Alert[] = [
  {
    id: 'AL-001',
    assetId: 'WT-001',
    severity: 'CRITICAL',
    type: 'HIGH_TEMPERATURE',
    message: 'Temperatura em nível crítico.',
    timestamp: '2026-09-15T12:00:00.000Z',
  },
  {
    id: 'AL-002',
    assetId: 'WT-002',
    severity: 'WARNING',
    type: 'HIGH_TEMPERATURE',
    message: 'Temperatura acima do limite de atenção.',
    timestamp: '2026-09-15T11:00:00.000Z',
  },
];

describe('AlertsComponent', () => {
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AlertsComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('deve carregar e renderizar alertas com severidade textual', () => {
    const fixture = TestBed.createComponent(AlertsComponent);
    const component = fixture.componentInstance;

    fixture.detectChanges();
    expect(component.loading()).toBe(true);

    const req = httpMock.expectOne('http://localhost:3000/alerts');
    expect(req.request.method).toBe('GET');
    req.flush(mockAlerts);

    fixture.detectChanges();
    expect(component.loading()).toBe(false);
    expect(component.alerts().length).toBe(2);

    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelectorAll('.alert-item').length).toBe(2);
    expect(el.textContent).toContain('CRITICAL');
    expect(el.textContent).toContain('WARNING');
    expect(el.textContent).toContain('WT-001');
    expect(el.textContent).toContain('Temperatura em nível crítico.');
  });

  it('deve exibir estado de erro quando a API falhar', () => {
    const fixture = TestBed.createComponent(AlertsComponent);
    const component = fixture.componentInstance;

    fixture.detectChanges();
    const req = httpMock.expectOne('http://localhost:3000/alerts');
    req.error(new ProgressEvent('Network Error'));

    fixture.detectChanges();
    expect(component.loading()).toBe(false);
    expect(component.error()).toContain('alertas');

    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.error-state')).toBeTruthy();
    expect(el.textContent).toContain('Tentar novamente');
  });

  it('deve exibir estado vazio quando a API retornar lista vazia', () => {
    const fixture = TestBed.createComponent(AlertsComponent);
    const component = fixture.componentInstance;

    fixture.detectChanges();
    const req = httpMock.expectOne('http://localhost:3000/alerts');
    req.flush([]);

    fixture.detectChanges();
    expect(component.alerts().length).toBe(0);

    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.empty-state')).toBeTruthy();
    expect(el.textContent).toContain('Nenhum alerta registrado');
  });
});