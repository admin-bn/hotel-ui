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

import {Component, ViewChild} from '@angular/core';
import {HotelService} from '../../../../../services/hotel/hotel.service';
import {HotelDTO} from '../../../../../../api-client';
import {FormValidator} from '../../../../../utilities/form-validators/form-validator';
import {ApplicationURL} from '../../../../../utilities/application-url';
import {Router} from '@angular/router';
import {BadRequestError} from '../../../../../models/BadRequestError';
import {ErrorTypeDeterminer} from '../../../../../utilities/error-type-determiner/error-type-determiner';
import {HotelFormComponent} from '../hotel-form/hotel-form.component';

enum AddHotelBadRequestError {
  NotUnique = 'A hotel with the given id already exists.'
}

@Component({
  selector: 'app-add-hotel',
  templateUrl: './add-hotel.component.html',
  styleUrls: ['./add-hotel.component.scss']
})
export class AddHotelComponent {
  public genericErrorNotificationVisible: boolean = false;

  @ViewChild(HotelFormComponent)
  private readonly hotelFormComponent?: HotelFormComponent;

  public constructor(public readonly formValidator: FormValidator,
                     private readonly router: Router,
                     private readonly hotelService: HotelService) {
  }

  public async submitAddHotel(): Promise<void> {
    if (this.hotelFormComponent?.hotelForm.valid) {
      const hotel = this.createHotelDTO();

      try {
        await this.hotelService.createHotel(hotel);

        this.router.navigateByUrl(ApplicationURL.AdminHotelManagement);
      } catch (httpErrorResponse: any) {
        this.checkErrorResponseType(httpErrorResponse);
      }
    }
  }

  public discard(): void {
    this.router.navigateByUrl(ApplicationURL.AdminHotelManagement);
  }

  public closeErrorNotification(): void {
    this.genericErrorNotificationVisible = false;
  }

  private createHotelDTO(): HotelDTO {
    return this.formValidator.getSanitizedRawFormValues(this.hotelFormComponent!.hotelForm);
  }

  private checkErrorResponseType(httpErrorResponse: any): void {
    if (ErrorTypeDeterminer.isHttpErrorResponse(httpErrorResponse) &&
        ErrorTypeDeterminer.isErrorTypeBadRequest(httpErrorResponse.error)) {
      this.handleBadRequestError(httpErrorResponse.error);
    } else {
      this.genericErrorNotificationVisible = true;
    }
  }

  private handleBadRequestError(badRequestError: BadRequestError): void {
    if (badRequestError.detail.includes(AddHotelBadRequestError.NotUnique)) {
      this.hotelFormComponent!.hotelForm.get('id')!.setErrors({'not-unique': true});
    }
  }
}
