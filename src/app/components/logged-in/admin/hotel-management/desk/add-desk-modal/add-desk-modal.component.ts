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
import {BaseModal} from 'carbon-components-angular';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {FormValidator} from '../../../../../../utilities/form-validators/form-validator';
import {v4 as uuidv4} from 'uuid';

@Component({
  selector: 'app-add-desk-modal',
  templateUrl: './add-desk-modal.component.html',
  styleUrls: ['./add-desk-modal.component.scss']
})
export class AddDeskModalComponent extends BaseModal {
  public deskForm: FormGroup;
  public deskFormValue?: {deskName: string, deskId: string};

  public constructor(public readonly formValidator: FormValidator,
                     private readonly formBuilder: FormBuilder) {
    super();

    this.deskForm = this.createDeskFrom();
  }

  private createDeskFrom(): FormGroup {
    return this.formBuilder.group({
      deskName: new FormControl('', [
        Validators.required,
        Validators.maxLength(100),
        this.formValidator.requiredNoWhitespaceFill()
      ]),
      deskId: uuidv4()
    });
  }

  public cancel(): any {
    this.closeModal();
  }

  public save(): any {
    this.deskFormValue = this.formValidator.getSanitizedRawFormValues(this.deskForm);

    this.closeModal();
  }
}
