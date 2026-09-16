import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { App } from './app';

describe('App Component — Health Integration', () => {
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
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

  it('deve iniciar verificando a saúde da API e mudar para "online" em caso de sucesso', async () => {
    const fixture = TestBed.createComponent(App);
    const component = fixture.componentInstance;

    // Inicialmente dispara ngOnInit e chama GET /health
    fixture.detectChanges();
    expect(component.apiState()).toBe('loading');

    const req = httpMock.expectOne('http://localhost:3000/health');
    expect(req.request.method).toBe('GET');

    // Responde com sucesso
    req.flush({ status: 'ok' });

    fixture.detectChanges();
    expect(component.apiState()).toBe('online');
    expect(component.errorMessage()).toBeNull();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.health-badge')?.textContent).toContain('API Online');
  });

  it('deve mudar para "offline" e exibir mensagem quando a API falhar', async () => {
    const fixture = TestBed.createComponent(App);
    const component = fixture.componentInstance;

    fixture.detectChanges();
    const req = httpMock.expectOne('http://localhost:3000/health');

    // Simula erro de rede/servidor
    req.error(new ProgressEvent('Network error'));

    fixture.detectChanges();
    expect(component.apiState()).toBe('offline');
    expect(component.errorMessage()).toContain('Falha na comunicação');

    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.health-badge')?.textContent).toContain('API Indisponível');
    expect(el.querySelector('.offline-banner')?.textContent).toContain('Aviso de Conexão');
  });
});
