import { FocusMonitor } from "@angular/cdk/a11y";
import { BooleanInput, coerceBooleanProperty } from "@angular/cdk/coercion";
import {
  Component,
  ElementRef,
  HostBinding,
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
  FormGroup,
  NgControl,
  NG_VALIDATORS,
  ValidatorFn,
  Validators,
} from "@angular/forms";
import { DateAdapter } from "@angular/material/core";
import { MatDatepickerInputEvent } from "@angular/material/datepicker";
import {
  MatFormField,
  MatFormFieldControl,
  MAT_FORM_FIELD,
} from "@angular/material/form-field";
import { MatInput } from "@angular/material/input";
import { IMaskDirective } from "angular-imask";
import IMask from "imask";
import { DateTime } from "luxon";
import { Subject } from "rxjs";
import { DateLocaleMaskService } from "./date-locale-mask.service";

export function validateDateTimeFactory(): ValidatorFn {
  return (c: AbstractControl) => {
    if (c.value instanceof DateTime) {
      return null;
    }
    if (typeof c.value == "string" && c.value == "") {
      return null;
    }
    return { "invalid-date": true };
  };
}

@Component({
  selector: "gb-datepicker",
  templateUrl: "datepicker-locale.component.html",
  styleUrls: ["datepicker-locale.component.scss"],
  providers: [
    { provide: MatFormFieldControl, useExisting: DatepickerLocaleComponent },
    {
      provide: NG_VALIDATORS,
      useFactory: validateDateTimeFactory,
      multi: true,
    },
  ],
  // host: {
  //   "[class.example-floating]": "shouldLabelFloat",
  //   "[id]": "id",
  // },
})
export class DatepickerLocaleComponent
  implements
    ControlValueAccessor,
    MatFormFieldControl<DateTime | string | null>,
    OnDestroy
{
  private static nextId = 0;
  @ViewChild("maskDate", { read: IMaskDirective })
  dateMaskDirective: IMaskDirective<IMask.MaskedDate>;
  @ViewChild("maskTime", { read: IMaskDirective })
  timeMaskDirective: IMaskDirective<IMask.MaskedDate>;
  @ViewChild("datePicker", { read: MatInput })
  datePicker: MatInput;

  readonly dateMaskConfig: IMask.MaskedDate;
  readonly timeMaskConfig: IMask.MaskedDate;

  parts: FormGroup = this.fb.group({
    maskDate: [""],
    maskTime: [""],
  });

  stateChanges = new Subject<void>();
  focused: boolean = false;
  touched: boolean = false;
  controlType = "gb-datepicker";

  @HostBinding()
  id = `gb-datepicker-${DatepickerLocaleComponent.nextId++}`;

  onChange = (_: any) => {};
  onTouched = () => {};

  get empty() {
    const {
      value: { maskDate, maskTime },
    } = this.parts;
    return !maskDate && !maskTime;
  }

  @HostBinding("class.floating")
  get shouldLabelFloat() {
    return this.focused || !this.empty;
  }

  get errorState(): boolean {
    return this.parts.invalid && this.touched;
  }

  @Input() withTime: boolean = false;
  @Input() dateSeparator: string = "/";
  @Input() maxDate?: DateTime;
  @Input() minDate?: DateTime;

  @Input("aria-describedby") userAriaDescribedBy: string;

  @Input()
  get placeholder(): string {
    return this._placeholder;
  }
  set placeholder(placeholder: string) {
    this._placeholder = placeholder;
    this.stateChanges.next();
  }
  private _placeholder: string = "";

  @Input()
  get required(): boolean {
    return this._required;
  }
  set required(value: BooleanInput) {
    this._required = coerceBooleanProperty(value);
    this.stateChanges.next();
  }
  private _required = false;

  @Input()
  get disabled(): boolean {
    return this._disabled;
  }
  set disabled(value: boolean) {
    this._disabled = coerceBooleanProperty(value);
    this._disabled ? this.parts.disable() : this.parts.enable();
    this.stateChanges.next();
  }
  private _disabled = false;

  @Input()
  get value(): DateTime | string | null {
    if (this.parts.valid) {
      if (!this.dateMaskConfig.typedValue) return ""; // when empty is valid
      return this.dateLocaleMaskService.fromJSDate(
        this.dateMaskConfig.typedValue,
        this.timeMaskConfig.typedValue
      );
    }
    return null;
  }
  set value(val: DateTime | string | null) {
    if (val instanceof DateTime) {
      this.parts.setValue({
        maskDate: val.toFormat(this.dateLocaleMaskService.getDateFormat()),
        maskTime: val.toFormat(this.dateLocaleMaskService.getTimeFormat()),
      });
    } else {
      this.parts.setValue({ maskDate: "", maskTime: "" });
    }
    this.stateChanges.next();
  }

  constructor(
    readonly fb: FormBuilder,
    private _focusMonitor: FocusMonitor,
    private adapter: DateAdapter<any>,
    private _elementRef: ElementRef<HTMLElement>,
    private dateLocaleMaskService: DateLocaleMaskService,
    @Optional() @Inject(MAT_FORM_FIELD) public _formField: MatFormField,
    @Optional() @Self() public ngControl: NgControl
  ) {
    if (this.ngControl !== null) this.ngControl.valueAccessor = this;
    this.dateMaskConfig = this.dateLocaleMaskService.createDateMask(
      this.dateSeparator,
      this.minDate,
      this.maxDate
    );
    this.timeMaskConfig = this.dateLocaleMaskService.createTimeMask();
  }

  ngOnInit() {
    this.setFormValidators();
  }

  ngOnDestroy() {
    this.stateChanges.complete();
    this._focusMonitor.stopMonitoring(this._elementRef);
  }

  writeValue(date: DateTime | null): void {
    this.beginWrite(date);
    this.value = date;
    this.endWrite();
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  setDescribedByIds(ids: string[]) {
    const controlElement =
      this._elementRef.nativeElement.querySelector(".wrapper")!;
    controlElement.setAttribute("aria-describedby", ids.join(" "));
  }

  onFocusIn(event: FocusEvent) {
    if (!this.focused) {
      this.focused = true;
      this.stateChanges.next();
    }
  }

  onContainerClick(event: MouseEvent) {
    // if (this.parts.controls.maskTime.valid) {
    //   this._focusMonitor.focusVia(this.maskTimeInput, "program");
    // } else {
    //   this._focusMonitor.focusVia(this.maskDateInput, "program");
    // }
    if ((event.target as Element).tagName.toLowerCase() != "input") {
      this._elementRef.nativeElement.querySelector("input")!.focus();
    }
  }

  onFocusOut(event: FocusEvent) {
    if (
      !this._elementRef.nativeElement.contains(event.relatedTarget as Element)
    ) {
      this.touched = true;
      this.focused = false;
      this.onTouched();
      this.stateChanges.next();
    }
  }

  onInput(control: AbstractControl, nextElement?: HTMLInputElement): void {
    this.autoFocusNext(control, nextElement);
  }

  onMaskInput() {
    if (!this._writing) this.onChange(this.value);
  }

  private _writing: boolean = false;
  private _writingValue: any;

  beginWrite(value: any): void {
    this._writing = true;
    this._writingValue = value;
  }

  endWrite(): any {
    this._writing = false;
    return this._writingValue;
  }

  onMaskAccept() {
    if (!this._writing) this.onChange(this.value);
  }

  onMaskDateComplete() {
    this.datePicker.value = this.dateMaskConfig.typedValue;
    if (!this._writing) this.onChange(this.value);
  }

  autoFocusNext(
    control: AbstractControl,
    nextElement?: HTMLInputElement
  ): void {
    if (!control.errors && nextElement) {
      this._focusMonitor.focusVia(nextElement, "program");
    }
  }

  dateHint() {
    return this.dateLocaleMaskService.getDateHintFormat();
  }

  autoFocusPrev(control: AbstractControl, prevElement: HTMLInputElement): void {
    if (control.value.length < 1) {
      this._focusMonitor.focusVia(prevElement, "program");
    }
  }

  setMaskDateFromDatepicker(event: MatDatepickerInputEvent<Date>): void {
    this.dateMaskConfig.typedValue = DateTime.fromISO(
      event.value?.toString()!
    ).toJSDate();
    this.dateMaskDirective.maskRef?.updateControl();
    this.onChange(this.value);
  }

  showDateTime() {
    const {
      value: { maskDate, maskTime },
    } = this.parts;

    console.log(`show datetime ${this.value}`);
    console.log(`show date ${maskDate}`);
    console.log(`show time  ${maskTime}`);
  }

  private setFormValidators() {
    const dateLength = this.dateLocaleMaskService.getDateNoMaskLength();
    const timeLength = this.dateLocaleMaskService.getTimeNoMaskLength();

    this.parts
      .get("maskDate")
      ?.setValidators([
        Validators.minLength(dateLength),
        Validators.maxLength(dateLength),
      ]);

    if (this.withTime)
      this.parts
        .get("maskTime")
        ?.setValidators([
          Validators.minLength(timeLength),
          Validators.maxLength(timeLength),
        ]);
  }

  toggleLocale(): void {
    const formats: Array<string> = ["en-US", "ja-JP", "fr-FR"];
    const currentDate = this.dateMaskConfig.typedValue;
    this.dateLocaleMaskService.locale =
      formats[(formats.indexOf(this.dateLocaleMaskService.locale) + 1) % 3];
    this.adapter.setLocale(this.dateLocaleMaskService.locale);
    this.dateMaskConfig.updateOptions(
      this.dateLocaleMaskService.getDateMaskUpdateOptions()
    );
    this.dateMaskConfig.typedValue = currentDate;
    this.dateMaskDirective.maskRef!.updateControl();
  }
}
