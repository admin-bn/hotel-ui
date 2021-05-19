/*
 * Copyright 2021 Bundesreplublik Deutschland
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {Component} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {AuthService} from '../../services/auth/auth.service';
import {FormValidator} from '../../utilities/form-validators/form-validator';
import {Router} from '@angular/router';
import {ApplicationURL} from '../../utilities/application-url';
import {CurrentUser} from '../../utilities/user/current-user/current-user';
import {ModalService} from 'carbon-components-angular';
import {ContactModalComponent} from './contact-modal/contact-modal.component';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  public loginForm: FormGroup;
  public passwordInputValueHidden: boolean = true;

  public constructor(public formValidator: FormValidator,
                     private readonly currentUser: CurrentUser,
                     private readonly router: Router,
                     private readonly formBuilder: FormBuilder,
                     private readonly authService: AuthService,
                     private readonly modalService: ModalService) {
    this.loginForm = this.createLoginForm();
  }

  public async login(): Promise<void> {
    if (this.loginForm.valid) {
      const credentials = this.formValidator.getSanitizedRawFormValues(this.loginForm);

      try {
        await this.authService.login(credentials);

        if (this.currentUser.isAdmin()) {
          this.router.navigateByUrl(ApplicationURL.AdminDashBoard);
        } else {
          this.router.navigateByUrl(ApplicationURL.Dashboard);
        }
      } catch (error: any) {
        this.resetLoginWithCredentialsError();
      }
    }
  }

  public togglePasswordVisibility(): void {
    this.passwordInputValueHidden = !this.passwordInputValueHidden;
  }

  public showContactModal(): void {
    this.modalService.create({component: ContactModalComponent});
  }

  private resetLoginWithCredentialsError(): void {
    this.loginForm.get('password')!.reset();
    this.loginForm.get('password')!.setErrors({'credentialsError': true});
    this.loginForm.get('password')!.markAsTouched();
  }

  private createLoginForm(): FormGroup {
    return this.formBuilder.group({
      username: new FormControl('', [
        Validators.required,
        this.formValidator.requiredNoWhitespace(),
        this.formValidator.requiredNoWhitespaceFill()
      ]),
      password: new FormControl('', [
        Validators.required,
        this.formValidator.requiredNoWhitespace(),
        this.formValidator.requiredNoWhitespaceFill()
      ])
    });
  }
}
