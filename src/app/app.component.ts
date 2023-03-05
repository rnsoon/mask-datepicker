import { FocusMonitor } from "@angular/cdk/a11y";
import { BooleanInput, coerceBooleanProperty } from "@angular/cdk/coercion";
import {
  Component,
  ElementRef,
  Inject,
  Input,
  OnDestroy,
  Optional,
  Self,
  ViewChild,
} from "@angular/core";
import {
  AbstractControl,
  ControlValueAccessor,
  FormBuilder,
  FormControl,
  FormGroup,
  NgControl,
  Validators,
} from "@angular/forms";
import {
  MAT_FORM_FIELD,
  MatFormField,
  MatFormFieldControl,
} from "@angular/material/form-field";
import { DateTime } from "luxon";
import { Subject } from "rxjs";

/** @title Form field with custom telephone number input control. */
@Component({
  selector: "app-root",
  templateUrl: "app.component.html",
})
export class FormFieldCustomControlExample {
  form: FormGroup;
  constructor(readonly fb: FormBuilder) {}
  ngOnInit() {
    this.form = this.fb.group({
      expirationDate: [""],
    });
  }

  setInput() {
    this.form.setValue({
      expirationDate: DateTime.fromJSDate(new Date(2022, 10, 12, 12, 35)),
    });
  }

  getMaxDate(): DateTime {
    return DateTime.local();
  }

  getMinDate(): DateTime {
    return DateTime.fromISO("2023-02-12T00:00:00.000");
  }

  reset() {
    this.form.markAsPristine();
  }

  showDateTime() {
    console.log(
      `show expiration date ${this.form.get("expirationDate")?.value}`
    );
    console.log(`show dirty ${this.form.dirty}`);
  }
}
