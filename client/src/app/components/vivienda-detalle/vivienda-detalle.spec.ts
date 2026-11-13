import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ViviendaDetalle } from './vivienda-detalle';

describe('ViviendaDetalle', () => {
  let component: ViviendaDetalle;
  let fixture: ComponentFixture<ViviendaDetalle>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
      imports: [ViviendaDetalle],
    }).compileComponents();

    fixture = TestBed.createComponent(ViviendaDetalle);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
