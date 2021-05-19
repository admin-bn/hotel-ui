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
import {BookingDataDTO, CheckInCredentialDTO, PMSDataDTO} from '../../../../api-client';
import {NavigationExtras, Router} from '@angular/router';
import {HotelIntegrationService} from '../../../services/hotel-integration/hotel-integration.service';
import {ApplicationURL} from '../../../utilities/application-url';
import {BookingDataValidation} from 'src/app/models/BookingDataValidation';

@Component({
  selector: 'app-booking-data-comparison',
  templateUrl: './booking-data-comparison.component.html',
  styleUrls: ['./booking-data-comparison.component.scss']
})
export class BookingDataComparisonComponent {
  public checkInCredential?: CheckInCredentialDTO;
  public bookingData?: BookingDataDTO;
  public notificationType?: string;
  public notificationMessage?: string;
  public bookingDataValidation?: BookingDataValidation;

  public constructor(private readonly router: Router,
                     private readonly hotelIntegrationControllerService: HotelIntegrationService) {
    this.checkInCredential = this.router.getCurrentNavigation()!.extras.state!.checkInCredential;
    this.bookingData = this.router.getCurrentNavigation()!.extras.state!.bookingData;
    this.setNotification();
    this.bookingDataValidation = this.getBookingDataValidation();
  }

  public async sendDataToPMS(): Promise<void> {
    const navExtras: NavigationExtras = {
      state: {
        success: false
      }
    };

    try {
      await this.hotelIntegrationControllerService.sendDataToPMS(this.getPMSData());
      navExtras.state!.success = true;
    } catch (error: any) {
      console.error(error);
    } finally {
      this.router.navigate([ApplicationURL.BookingDataComparisonNotification], navExtras);
    }
  }

  public getPMSData(): PMSDataDTO {
    return {
      bookingData: this.bookingData,
      checkInCredential: this.checkInCredential
    };
  }

  public isBookingFirstNameEqualToMasterIdFirstName(): boolean {
    return (this.bookingData?.firstName === this.checkInCredential?.masterId.firstName);
  }

  public isBookingLastNameEqualToMasterIdLastName(): boolean {
    return (this.bookingData?.lastName === this.checkInCredential?.masterId.familyName);
  }

  public isBookingStreetEqualToMasterIdStreet(): boolean {
    return (this.bookingData?.companyAddressStreet === this.checkInCredential?.masterId.addressStreet);
  }

  public isBookingZipCodeEqualToMasterIdZipCode(): boolean {
    return (this.bookingData?.companyAddressZipCode === this.checkInCredential?.masterId.addressZipCode);
  }

  public isBookingCityEqualToMasterIdCity(): boolean {
    return (this.bookingData?.companyAddressCity === this.checkInCredential?.masterId.addressCity);
  }

  public showPrintDialog(): void {
    window.print();
  }

  private setNotification(): void {
    if (!this.areDatasetsValid()) {
      this.notificationType = 'warning';
      this.notificationMessage = 'are different';
    } else {
      this.notificationType = 'success';
      this.notificationMessage = 'complete';
    }
  }

  private areDatasetsValid(): boolean {
    return this.isBookingFirstNameEqualToMasterIdFirstName() &&
           this.isBookingLastNameEqualToMasterIdLastName() &&
           this.isBookingStreetEqualToMasterIdStreet() &&
           this.isBookingZipCodeEqualToMasterIdZipCode() &&
           this.isBookingCityEqualToMasterIdCity();
  }

  private getBookingDataValidation(): BookingDataValidation {
    return {
      isFirstNameValid: this.isBookingFirstNameEqualToMasterIdFirstName(),
      isLastNameValid: this.isBookingLastNameEqualToMasterIdLastName(),
      isStreetValid: this.isBookingStreetEqualToMasterIdStreet(),
      isZipCodeValid: this.isBookingZipCodeEqualToMasterIdZipCode(),
      isCityValid: this.isBookingCityEqualToMasterIdCity()
    };
  }
}
