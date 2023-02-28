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
    this.form.setValue({
      expirationDate: DateTime.fromJSDate(new Date(2022, 11, 12, 12, 35)),
    });
  }
  ngAfterViewInit() {
    setTimeout(() => {
      this.form.setValue({
        expirationDate: DateTime.fromJSDate(new Date(2022, 11, 12, 12, 35)),
      });
    });
  }
  setInput() {
    this.form.setValue({
      expirationDate: DateTime.fromJSDate(new Date(2022, 11, 12, 12, 35)),
    });
  }

  showDateTime() {
    const {
      value: { expirationDate },
    } = this.form;
    console.log(`show datetime ${expirationDate}`);
    console.log(`show dirty ${this.form.dirty}`);
  }
}
