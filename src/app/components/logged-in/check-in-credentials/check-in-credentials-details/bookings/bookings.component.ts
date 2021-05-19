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

import {DatePipe} from '@angular/common';
import {AfterViewInit, ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, Output, ViewChild} from '@angular/core';
import {NotificationContent, TableHeaderItem, TableItem} from 'carbon-components-angular';
import {Subscription} from 'rxjs';
import {BookingDataDTO, CheckInCredentialDTO} from '../../../../../../api-client';
import {HotelIntegrationService} from '../../../../../services/hotel-integration/hotel-integration.service';
import {TableComponent} from '../../../table/table.component';

@Component({
  selector: 'app-bookings',
  templateUrl: './bookings.component.html',
  styleUrls: ['./bookings.component.scss']
})
export class BookingsComponent implements AfterViewInit, OnDestroy {
  @Input()
  public checkInCredential!: CheckInCredentialDTO;

  @Input()
  public searchString!: string;

  @Output()
  public selectionChanged: EventEmitter<BookingDataDTO> = new EventEmitter<BookingDataDTO>();

  @Output()
  public rowSelectionChange: EventEmitter<boolean> = new EventEmitter<boolean>();

  public bookings?: BookingDataDTO[];
  public bookingIndexSubscription?: Subscription;
  public tableVisible: boolean = true;
  public warningNotification?: NotificationContent;
  public tableData: TableItem[][] = [];
  public tableHeader: TableHeaderItem[] = [];
  public loading: boolean = true;

  @ViewChild(TableComponent)
  private readonly tableComponent?: TableComponent;

  public constructor(private readonly hotelIntegrationService: HotelIntegrationService,
                     private readonly datePipe: DatePipe,
                     private readonly changeDetector: ChangeDetectorRef) {
  }

  public async ngAfterViewInit(): Promise<void> {
    this.tableHeader = this.createTableHeaders();

    this.changeDetector.detectChanges();

    this.bookings = await this.getRequiredBookings();
    this.tableData = this.createTableData();

    this.showErrorIfBookingsAreEmpty();
    this.changeDetector.detectChanges();
    this.emitOnRowSelectionChange();
    this.selectFirstRowIfSole();
  }

  private async getRequiredBookings(): Promise<BookingDataDTO[]> {
    if (this.searchString) {
      return await this.getFilteredBookingsForCredential();
    }

    return await this.getBookingsForCredential();
  }

  private showErrorIfBookingsAreEmpty(): void {
    if (this.bookings?.length) {
      return;
    }

    if (this.searchString) {
      this.showWarningNotification(`For the following Booking number: ${this.searchString}`);
    } else {
      this.showWarningNotification('Please continue with traditional check-in!');
    }
  }

  private emitOnRowSelectionChange(): void {
    this.bookingIndexSubscription = this.tableComponent!.tableModel.rowsSelectedChange.subscribe((selectedIndex) => {
      if (this.bookings) {
        this.selectionChanged.emit(this.bookings[selectedIndex]);
        this.rowSelectionChange.emit(this.isAnyRowSelected());
      }
    });
  }

  private isAnyRowSelected(): boolean {
    return this.tableComponent!.tableModel.rowsSelected.includes(true);
  }

  private selectFirstRowIfSole(): void {
    if (this.bookings!.length === 1) {
      this.tableComponent!.tableModel.selectRow(0);
    }
  }

  private createTableHeaders(): TableHeaderItem[] {
    return [
      new TableHeaderItem({data: 'Last name'}),
      new TableHeaderItem({data: 'First name'}),
      new TableHeaderItem({data: 'E-Mail'}),
      new TableHeaderItem({data: 'Booking Number'}),
      new TableHeaderItem({data: 'Arrival'}),
      new TableHeaderItem({data: 'Departure'})
    ];
  }

  private async getBookingsForCredential(): Promise<BookingDataDTO[]> {
    return await this.hotelIntegrationService.lookup(this.checkInCredential);
  }

  private async getFilteredBookingsForCredential(): Promise<BookingDataDTO[]> {
    return await this.hotelIntegrationService.lookup(this.checkInCredential, this.searchString);
  }

  private showWarningNotification(warningMessage: string): void {
    this.tableVisible = false;
    this.warningNotification = {
      type: 'warning',
      title: 'No booking found.',
      message: warningMessage,
      showClose: false
    };
  }

  private createTableData(): TableItem[][] {
    const tableData: TableItem[][] = [];

    this.bookings!.forEach((booking) => {
      tableData.push([
        new TableItem({data: booking.firstName}),
        new TableItem({data: booking.lastName}),
        new TableItem({data: booking.companyEmail}),
        new TableItem({data: booking.bookingId}),
        new TableItem({data: this.datePipe.transform(booking.arrivalDate, 'shortDate')}),
        new TableItem({data: this.datePipe.transform(booking.departureDate, 'shortDate')})
      ]);
    });
    this.loading = false;

    return tableData;
  }

  public ngOnDestroy(): void {
    this.bookingIndexSubscription?.unsubscribe();
  }
}
