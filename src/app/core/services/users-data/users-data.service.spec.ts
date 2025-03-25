import { TestBed } from '@angular/core/testing';

import { UsersDataService } from './users-data.service';
import {provideExperimentalZonelessChangeDetection} from "@angular/core";

describe('UsersDataService', () => {
  let service: UsersDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideExperimentalZonelessChangeDetection()
      ]
    });
    service = TestBed.inject(UsersDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
