import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InputErrorComponent } from './input-error.component';
import {provideExperimentalZonelessChangeDetection} from "@angular/core";

describe('InputErrorComponent', () => {
  let component: InputErrorComponent;
  let fixture: ComponentFixture<InputErrorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InputErrorComponent],
      providers: [
        provideExperimentalZonelessChangeDetection()
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InputErrorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
