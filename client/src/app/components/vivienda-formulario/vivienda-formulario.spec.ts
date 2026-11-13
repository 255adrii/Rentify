import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ViviendaFormulario } from './vivienda-formulario';

describe('ViviendaFormulario', () => {
  let component: ViviendaFormulario;
  let fixture: ComponentFixture<ViviendaFormulario>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
      imports: [ViviendaFormulario],
    }).compileComponents();

    fixture = TestBed.createComponent(ViviendaFormulario);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
