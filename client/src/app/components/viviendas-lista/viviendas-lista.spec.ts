import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ViviendasLista } from './viviendas-lista';

describe('ViviendasLista', () => {
  let component: ViviendasLista;
  let fixture: ComponentFixture<ViviendasLista>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
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
