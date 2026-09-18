import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { AssetsListComponent } from './assets-list.component';
import { Asset } from '../../models/windops.models';

const mockAssets: Asset[] = [
  {
    id: 'WT-001',
    name: 'Aerogerador 01',
    type: 'WIND_TURBINE',
    status: 'ONLINE',
    ratedPowerMw: 3.2,
    location: 'Parque Demo A',
  },
  {
    id: 'PV-001',
    name: 'Painel Solar 01',
    type: 'SOLAR_ARRAY',
    status: 'MAINTENANCE',
    ratedPowerMw: 1.5,
    location: 'Parque Demo B',
  },
];

describe('AssetsListComponent', () => {
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssetsListComponent],
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

  it('deve carregar e renderizar os cards de ativos com sucesso', () => {
    const fixture = TestBed.createComponent(AssetsListComponent);
    const component = fixture.componentInstance;

    fixture.detectChanges();
    expect(component.loading()).toBe(true);

    const req = httpMock.expectOne('http://localhost:3000/assets');
    expect(req.request.method).toBe('GET');
    req.flush(mockAssets);

    fixture.detectChanges();
    expect(component.loading()).toBe(false);
    expect(component.assets().length).toBe(2);

    const el = fixture.nativeElement as HTMLElement;
    const cards = el.querySelectorAll('.asset-card');
    expect(cards.length).toBe(2);
    expect(el.textContent).toContain('WT-001');
    expect(el.textContent).toContain('Aerogerador 01');
    expect(el.textContent).toContain('PV-001');
  });

  it('deve exibir estado de erro quando a API falhar', () => {
    const fixture = TestBed.createComponent(AssetsListComponent);
    const component = fixture.componentInstance;

    fixture.detectChanges();
    const req = httpMock.expectOne('http://localhost:3000/assets');
    req.error(new ProgressEvent('Network Error'));

    fixture.detectChanges();
    expect(component.loading()).toBe(false);
    expect(component.error()).toContain('Não foi possível carregar os ativos');

    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.error-state')).toBeTruthy();
    expect(el.textContent).toContain('Tentar novamente');
  });

  it('deve exibir estado vazio quando a API retornar lista vazia', () => {
    const fixture = TestBed.createComponent(AssetsListComponent);
    const component = fixture.componentInstance;

    fixture.detectChanges();
    const req = httpMock.expectOne('http://localhost:3000/assets');
    req.flush([]);

    fixture.detectChanges();
    expect(component.loading()).toBe(false);
    expect(component.assets().length).toBe(0);

    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.empty-state')).toBeTruthy();
    expect(el.textContent).toContain('Nenhum ativo encontrado');
  });
});
