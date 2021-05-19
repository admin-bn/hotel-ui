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
import {AfterViewInit, Component, NgZone, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {TableHeaderItem, TableItem} from 'carbon-components-angular';
import {HotelService} from '../../../../services/hotel/hotel.service';
import {Router} from '@angular/router';
import {ApplicationURL} from '../../../../utilities/application-url';
import {CheckInCredentialsService} from '../../../../services/check-in-credentials/check-in-credentials.service';
import {CheckInCredentialDTO, DeskDTO} from '../../../../../api-client';
import {Subscription} from 'rxjs';
import {AppConfigurationsService} from '../../../../services/app-configurations/app-configurations.service';
import {TableComponent} from '../../table/table.component';

@Component({
  selector: 'app-check-in-credentials-overview',
  templateUrl: './check-in-credentials-overview.component.html',
  styleUrls: ['./check-in-credentials-overview.component.scss']
})
export class CheckInCredentialsOverviewComponent implements OnInit, OnDestroy, AfterViewInit {
  public loading: boolean = false;
  public desk?: DeskDTO;
  public tableData: TableItem[][] = [];
  public tableHeader: TableHeaderItem[] = [];
  public genericErrorNotificationVisible: boolean = false;

  private eventSource?: EventSource;
  private checkinCredentials: CheckInCredentialDTO[] = [];
  private selectedCredentialId?: string;
  private credentialsIndexSubscription?: Subscription;

  @ViewChild(TableComponent)
  private readonly tableComponent?: TableComponent;

  public constructor(private readonly checkInCredentialsService: CheckInCredentialsService,
                     private readonly hotelService: HotelService,
                     private readonly zone: NgZone,
                     private readonly datePipe: DatePipe,
                     private readonly router: Router,
                     private readonly config: AppConfigurationsService) {
  }

  public ngOnInit(): void {
    this.tableHeader = this.createTableHeaders();
    this.populateTable();
  }

  public ngAfterViewInit(): void {
    this.credentialsIndexSubscription = this.tableComponent!.tableModel.rowsSelectedChange.subscribe((selectedIndex) => {
      this.selectedCredentialId = this.tableComponent!.tableModel.data[selectedIndex][0].data;
    });
  }

  public showCredentialsDetails(): void {
    if (this.selectedCredentialId) {
      this.router.navigate([ApplicationURL.CheckInCredentials, this.selectedCredentialId]);
    }
  }

  public closeErrorNotification(): void {
    this.genericErrorNotificationVisible = false;
  }

  public isRowSelected(): boolean {
    if (this.tableComponent) {
      return this.tableComponent.tableModel.selectedRowsCount() !== 0;
    }

    return false;
  }

  private async createTableData(selectedDeskId: string): Promise<TableItem[][]> {
    this.loading = true;
    const tableData: TableItem[][] = [];
    try {
      this.checkinCredentials = await this.checkInCredentialsService.getCheckInDataForSelectedDesk(selectedDeskId);

      this.checkinCredentials.forEach((checkInCredential) => {
        if (checkInCredential) {
          tableData.push([
            new TableItem({data: checkInCredential.id}),
            new TableItem({data: checkInCredential.masterId?.firstName}),
            new TableItem({data: checkInCredential.masterId?.familyName}),
            new TableItem({data: checkInCredential.corporateId?.companyName}),
            new TableItem({data: this.datePipe.transform(checkInCredential.scanDate, 'shortDate')}),
            new TableItem({data: this.datePipe.transform(checkInCredential.scanDate, 'shortTime')})
          ]);
        }
      });
    } catch (error) {
      this.genericErrorNotificationVisible = true;
    }
    this.loading = false;

    return tableData;
  }

  private populateTable(): void {
    this.hotelService.getSelectedDesk().subscribe(async (selectedDesk) => {
      if (selectedDesk) {
        this.desk = selectedDesk;
        this.tableData = await this.createTableData(this.desk.id);

        this.subscribeToRefreshEvents(this.desk.id);
      }

      this.eventSource?.close();
    });
  }

  private subscribeToRefreshEvents(deskId: string): void {
    this.hotelService.getHotel().subscribe((hotel) => {
      this.eventSource = new EventSource(`${this.config.controllerAPIUrl}/api/checkin-credentials/subscribe?hotelId=${hotel?.id}&deskId=${deskId}`);

      this.eventSource.onmessage = (event) => {
        this.zone.run(async () => {
          this.tableData = await this.createTableData(deskId);
        });
      };
      this.eventSource.onerror = (error: any) => {
        this.genericErrorNotificationVisible = true;
      };
    });
  }

  private createTableHeaders(): TableHeaderItem[] {
    return [
      new TableHeaderItem({visible: false}),
      new TableHeaderItem({data: 'First name'}),
      new TableHeaderItem({data: 'Last name'}),
      new TableHeaderItem({data: 'Company'}),
      new TableHeaderItem({data: 'Scan date'}),
      new TableHeaderItem({data: 'Scan time'})
    ];
  }

  public ngOnDestroy(): void {
    this.eventSource?.close();
    this.credentialsIndexSubscription?.unsubscribe();
  }
}
