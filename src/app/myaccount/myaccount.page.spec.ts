import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MyaccountPage } from './myaccount.page';

describe('MyaccountPage', () => {
  let component: MyaccountPage;
  let fixture: ComponentFixture<MyaccountPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MyaccountPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MyaccountPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
