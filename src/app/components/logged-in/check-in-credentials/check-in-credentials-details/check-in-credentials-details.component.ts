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

import {Component, OnInit} from '@angular/core';
import {BookingDataDTO, CheckInCredentialDTO} from '../../../../../api-client';
import {ActivatedRoute, NavigationExtras, Router} from '@angular/router';
import {CheckInCredentialsService} from '../../../../services/check-in-credentials/check-in-credentials.service';
import {ApplicationURL} from '../../../../utilities/application-url';
import {NotificationContent} from 'carbon-components-angular';

@Component({
  selector: 'app-check-in-credentials-details',
  templateUrl: './check-in-credentials-details.component.html',
  styleUrls: ['./check-in-credentials-details.component.scss']
})
export class CheckInCredentialsDetailsComponent implements OnInit {
  public checkInCredential?: CheckInCredentialDTO;
  public selectedBooking?: BookingDataDTO;
  public searchComponentHidden: boolean = true;
  public searchString: string = '';
  public anyRowSelected: boolean = false;

  public constructor(private readonly router: Router,
                     private readonly activatedRoute: ActivatedRoute,
                     private readonly checkInCredentialsService: CheckInCredentialsService) {
  }

  public async ngOnInit(): Promise<void> {
    const checkInId = this.activatedRoute.snapshot.params.id;

    this.checkInCredential = await this.getCheckInCredential(checkInId);
  }

  public updateSelectedBooking(booking: BookingDataDTO): void {
    this.selectedBooking = booking;
  }

  public isAnyRowSelected(isRowSelected: boolean): void {
    this.anyRowSelected = isRowSelected;
  }

  public updateSearchString(searchValue: string): void {
    this.searchString = searchValue;
  }

  public goToBookingDataComparison(): void {
    const dataForBookingDataComparisonComponent: NavigationExtras = {
      state: {
        checkInCredential: this.checkInCredential,
        bookingData: this.selectedBooking
      }
    };

    this.router.navigate([ApplicationURL.BookingDataComparison], dataForBookingDataComparisonComponent);
  }

  public getNotification(): NotificationContent {
    let notificationContent: NotificationContent;

    if (this.checkInCredential?.valid) {
      notificationContent = {
        type: 'success',
        title: 'All credentials are valid'
      };
    } else {
      notificationContent = {
        type: 'error',
        title: 'At least one credential is invalid',
        message: 'Please proceed with traditional check-in procedure and inform the guest about invalidity of his/her credential. Common issues are: Guest has revoked his/her masterID credential. Guest has changed the employer and has still an old credential in his/her wallet.'
      };
    }

    notificationContent.lowContrast = true;
    notificationContent.showClose = false;

    return notificationContent;
  }

  public showSearchComponent(): void {
    this.searchComponentHidden = false;
  }

  public hideSearchComponent(): void {
    this.searchComponentHidden = true;
  }

  private async getCheckInCredential(checkInId: string): Promise<CheckInCredentialDTO> {
    return await this.checkInCredentialsService.getCheckInCredential(checkInId);
  }
}
