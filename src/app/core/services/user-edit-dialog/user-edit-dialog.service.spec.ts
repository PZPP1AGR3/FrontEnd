import {TestBed} from '@angular/core/testing';

import {UserEditDialogService} from './user-edit-dialog.service';
import {firstValueFrom} from "rxjs";
import {provideExperimentalZonelessChangeDetection} from "@angular/core";

describe('UserEditDialogService', () => {
  let service: UserEditDialogService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideExperimentalZonelessChangeDetection()
      ]
    });
    service = TestBed.inject(UserEditDialogService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should open dialog with specific user id', async () => {
    const result = firstValueFrom(service.openDialog$)

    service.edit(3);

    expect(await result).toBe(3);
  });

  it('should open dialog to create user', async () => {
    const result =  firstValueFrom(service.openDialog$)

    service.create();

    expect(await result).toBe(0);
  });

  it('should close dialog with changed feedback', async () => {
    const result =  firstValueFrom(service.onClose$)

    service.closed(true);

    expect(await result).toBe(true);
  });

  it('should close dialog with not-changed feedback', async () => {
    const result =  firstValueFrom(service.onClose$)

    service.closed(false);

    expect(await result).toBe(false);
  });
});
