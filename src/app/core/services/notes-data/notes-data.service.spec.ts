import { TestBed } from '@angular/core/testing';

import { NotesDataService } from './notes-data.service';
import {provideExperimentalZonelessChangeDetection} from "@angular/core";

describe('NotesDataService', () => {
  let service: NotesDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideExperimentalZonelessChangeDetection()
      ]
    });
    service = TestBed.inject(NotesDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
