import {FormControl, FormGroup} from "@angular/forms";
import {DestroyRef} from "@angular/core";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {debounceTime} from "rxjs";

export const passwordRepeatValidator = (
  formGroup: FormGroup,
  formControlName1: string,
  formControlName2: string,
  destroyRef?: DestroyRef
) => {
  return (
    destroyRef
      ? formGroup.valueChanges
        .pipe(
          takeUntilDestroyed(destroyRef),
          debounceTime(30)
        )
      : formGroup.valueChanges
        .pipe(
          debounceTime(30)
        )
  )
    .subscribe(() => {
      const formControl1 = formGroup.get(formControlName1) as FormControl,
        formControl2 = formGroup.get(formControlName2) as FormControl;
      if (!formControl1 || !formControl2) return;
      const areSame = formControl1.value === formControl2.value;
      let formControl1Errors = formControl1.errors,
        formControl2Errors = formControl2.errors;
      if (areSame) {
        if (formControl1Errors?.['passwordRepeat']) {
          delete formControl1Errors!['passwordRepeat'];
        }
        if (formControl2Errors?.['passwordRepeat']) {
          delete formControl2Errors!['passwordRepeat'];
        }
        if (
          formControl1Errors
          && Object.keys(formControl1Errors)!.length === 0
        ) {
          formControl1Errors = null;
        }
        if (
          formControl2Errors
          && Object.keys(formControl2Errors)!.length === 0
        ) {
          formControl2Errors = null;
        }
      } else {
        if (!formControl1Errors) formControl1Errors = {
          passwordRepeat: true
        }; else formControl1Errors['passwordRepeat'] = true;
        if (!formControl2Errors) formControl2Errors = {
          passwordRepeat: true
        }; else formControl2Errors['passwordRepeat'] = true;
      }
      formControl1.setErrors(
        formControl1Errors
      );
      formControl2.setErrors(
        formControl2Errors
      );
    });
}
