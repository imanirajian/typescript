import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddressCreate } from './address-create';

describe('AddressForm', () => {
  let component: AddressCreate;
  let fixture: ComponentFixture<AddressCreate>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddressCreate],
    }).compileComponents();

    fixture = TestBed.createComponent(AddressCreate);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
