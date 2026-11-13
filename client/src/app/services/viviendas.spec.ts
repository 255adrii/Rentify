import { TestBed } from '@angular/core/testing';
import { Viviendas } from './viviendas';

describe('Viviendas', () => {
  let service: Viviendas;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Viviendas);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
