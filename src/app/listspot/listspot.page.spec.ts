import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ListspotPage } from './listspot.page';

describe('ListspotPage', () => {
  let component: ListspotPage;
  let fixture: ComponentFixture<ListspotPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ListspotPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ListspotPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
