/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { PutComponent } from './put.component';

describe('PutComponent', () => {
  let component: PutComponent;
  let fixture: ComponentFixture<PutComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PutComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
