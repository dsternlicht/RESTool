/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { GetComponent } from './get.component';

describe('GetComponent', () => {
  let component: GetComponent;
  let fixture: ComponentFixture<GetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
