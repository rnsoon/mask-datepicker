import { FormControl } from "@angular/forms";

export class TrimmableFormControl extends FormControl<string> {
  override setValue(
    value: string,
    options?: { emitModelToViewChange?: boolean }
  ) {
    if (typeof value !== "string" || value === null || value === "") {
      super.setValue(value, options);
      return;
    }
    const trimmed = value.replace(/^\s+/, "");
    if (value !== trimmed) {
      if (!options) {
        options = {};
      }
      options.emitModelToViewChange = true;
    }
    super.setValue(value.trim(), options);
  }
}
