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

import {ComponentFixture, TestBed} from '@angular/core/testing';
import {ValidationMessageComponent} from './validation-message.component';
import {By} from '@angular/platform-browser';

describe('ValidationMessageComponent', () => {
  let validationMessageComponent: ValidationMessageComponent;
  let fixture: ComponentFixture<ValidationMessageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ValidationMessageComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ValidationMessageComponent);
    validationMessageComponent = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created successfully', () => {
    expect(validationMessageComponent).toBeTruthy();
  });

  it('if datasets are different, I should see a warning notification', () => {
    validationMessageComponent.notificationMessage = 'are different';
    validationMessageComponent.type = 'warning';
    fixture.detectChanges();

    const validationErrorIcon = fixture.debugElement.query(By.css('#check-in-credentials-validation-message'));

    expect(validationErrorIcon.nativeElement.textContent).toBe('are different');
  });

  it('if datasets are the same, I should see a success notification', () => {
    validationMessageComponent.notificationMessage = 'complete';
    validationMessageComponent.type = 'success';
    fixture.detectChanges();

    const validationSuccessIcon = fixture.debugElement.query(By.css('#check-in-credentials-validation-message'));

    expect(validationSuccessIcon.nativeElement.textContent).toBe('complete');
  });
});
