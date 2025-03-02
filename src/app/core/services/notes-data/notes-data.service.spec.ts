import { TestBed } from '@angular/core/testing';

import { NotesDataService } from './notes-data.service';

describe('NotesDataService', () => {
  let service: NotesDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NotesDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
