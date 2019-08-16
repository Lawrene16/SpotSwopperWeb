import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchasespotPage } from './purchasespot.page';

describe('PurchasespotPage', () => {
  let component: PurchasespotPage;
  let fixture: ComponentFixture<PurchasespotPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PurchasespotPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PurchasespotPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
