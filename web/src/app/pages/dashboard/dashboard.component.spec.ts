import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { DashboardComponent } from './dashboard.component';
import { DashboardOverview } from '../../models/windops.models';

const mockOverview: DashboardOverview = {
  totalAssets: 3,
  onlineAssets: 2,
  attentionAssets: 1,
  maintenanceAssets: 0,
  criticalAlerts: 1,
  totalAlerts: 4,
};

describe('DashboardComponent', () => {
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
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

  it('deve carregar o overview e renderizar os KPIs', () => {
    const fixture = TestBed.createComponent(DashboardComponent);
    const component = fixture.componentInstance;

    fixture.detectChanges();
    expect(component.loading()).toBe(true);

    const req = httpMock.expectOne('http://localhost:3000/dashboard/overview');
    expect(req.request.method).toBe('GET');
    req.flush(mockOverview);

    fixture.detectChanges();
    expect(component.loading()).toBe(false);
    expect(component.overview()?.totalAssets).toBe(3);

    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelectorAll('.kpi-card').length).toBe(6);
    expect(el.textContent).toContain('Total de Ativos');
    expect(el.textContent).toContain('Alertas Críticos');
  });

  it('deve exibir estado de erro quando a API falhar', () => {
    const fixture = TestBed.createComponent(DashboardComponent);
    const component = fixture.componentInstance;

    fixture.detectChanges();
    const req = httpMock.expectOne('http://localhost:3000/dashboard/overview');
    req.error(new ProgressEvent('Network Error'));

    fixture.detectChanges();
    expect(component.loading()).toBe(false);
    expect(component.error()).toContain('KPIs');

    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.error-state')).toBeTruthy();
    expect(el.textContent).toContain('Tentar novamente');
  });

  it('deve exibir estado vazio quando não há ativos', () => {
    const fixture = TestBed.createComponent(DashboardComponent);
    const component = fixture.componentInstance;

    fixture.detectChanges();
    const req = httpMock.expectOne('http://localhost:3000/dashboard/overview');
    req.flush({ ...mockOverview, totalAssets: 0 });

    fixture.detectChanges();
    expect(component.overview()?.totalAssets).toBe(0);

    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.empty-state')).toBeTruthy();
    expect(el.textContent).toContain('Nenhum ativo cadastrado');
  });
});