import { AbstractControl, FormGroup, ValidationErrors } from '@angular/forms';

export class UtilValidator {
  public static positiveNumberValidator(control: AbstractControl): ValidationErrors | null  {
    const isValid = control.value > 0;
    return isValid ? null : { notPositive: true };
  }

  public static htnrkd_oder_btnrlikd_required(formGroup: FormGroup){
    return (control: AbstractControl): { [key: string]: any } | null => {
      const btnrlikd = formGroup?.get("btnrlikd")?.value
      const btnrlikd_errors = formGroup?.get("btnrlikd")?.errors

      if(this.value_ist_leer(btnrlikd) && this.value_ist_leer(control.value)){
        if(btnrlikd_errors?.['required'] == null){
          formGroup?.get("btnrlikd")?.setErrors({ required: { value: btnrlikd }})
          formGroup?.get("htnrkd")?.setErrors({ required: { value: control.value }})
          formGroup?.get("htnrkd")?.updateValueAndValidity()
        }

        return { required: { value: control.value } };
      }else{
        if(btnrlikd_errors?.['required'] != null){
          formGroup?.get("btnrlikd")?.setErrors(null)
          formGroup?.get("htnrkd")?.setErrors(null)
          formGroup?.get("htnrkd")?.updateValueAndValidity()
        }
        
        return null;
      }
    }
  }

  public static btnrlikd_oder_htnrkd_required(formGroup: FormGroup){
    return (control: AbstractControl): { [key: string]: any } | null => {
      const htnrkd = formGroup?.get("htnrkd")?.value
      const htnrkd_errors = formGroup?.get("htnrkd")?.errors

      formGroup?.get("linamekd")?.updateValueAndValidity();

      if(this.value_ist_leer(htnrkd) && this.value_ist_leer(control.value)){
        if(htnrkd_errors?.['required'] == null){
          formGroup?.get("btnrlikd")?.setErrors({ required: { value: control.value }})
          formGroup?.get("htnrkd")?.setErrors({ required: { value: htnrkd }})
          formGroup?.get("htnrkd")?.updateValueAndValidity()
        }

        return { required: { value: control.value } };
      }else{
        if(htnrkd_errors?.['required'] != null){
          formGroup?.get("btnrlikd")?.setErrors(null)
          formGroup?.get("htnrkd")?.setErrors(null)
          formGroup?.get("htnrkd")?.updateValueAndValidity()
        }

        return null;
      }
    }
  }

  public static linamekd_required_wenn_btnrlikd_gesetzt(formGroup: FormGroup){
    return (control: AbstractControl): { [key: string]: any } | null => {
      const btnrlikd = formGroup?.get("btnrlikd")?.value

      if(!this.value_ist_leer(btnrlikd)){ // Wenn btnrlikd verwendet wird, darf linamekd nicht leer sein!
        if(this.value_ist_leer(control.value)){
          return { 'required': { value: control.value } };
        }
      }

      return null
    }
  }

  private static value_ist_leer(value: any){
    return (
      value === null 
      || value === undefined 
      || value === ""
    )
  }
}
