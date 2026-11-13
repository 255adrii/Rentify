import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ViviendasLista } from './viviendas-lista';

describe('ViviendasLista', () => {
  let component: ViviendasLista;
  let fixture: ComponentFixture<ViviendasLista>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
      imports: [ViviendasLista],
    }).compileComponents();

    fixture = TestBed.createComponent(ViviendasLista);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
