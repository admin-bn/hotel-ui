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

import {Component, OnInit, ComponentRef} from '@angular/core';
import {TableHeaderItem, TableItem, ModalService, ModalButtonType} from 'carbon-components-angular';
import {UserDTO, HotelDTO} from 'src/api-client';
import {UserService} from 'src/app/services/user/user.service';
import {HotelService} from 'src/app/services/hotel/hotel.service';
import {ApplicationURL} from 'src/app/utilities/application-url';
import {Router} from '@angular/router';
import {WarningModalComponent} from '../../warning-modal/warning-modal.component';

@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.scss']
})
export class UserManagementComponent implements OnInit {
  public loading: boolean = true;
  public users?: UserDTO[];
  public hotels?: HotelDTO[];
  public tableData: TableItem[][] = [];
  public tableHeader: TableHeaderItem[] = [];

  public constructor(private readonly modalService: ModalService,
                     private readonly userService: UserService,
                     private readonly hotelService: HotelService,
                     private readonly router: Router) {
  }

  public async ngOnInit(): Promise<any> {
    this.users = await this.getAllUsers();
    this.hotels = await this.getAllHotels();
    this.tableHeader = this.createTableHeaders();
    this.tableData = this.createTableData();
    this.loading = false;
  }

  public goToAddUserPage(): void {
    this.router.navigateByUrl(ApplicationURL.AdminAddUser);
  }

  public goToEditUserPage(user: UserDTO): void {
    this.router.navigate([ApplicationURL.AdminUserManagement, user.id, 'edit']);
  }

  public openDeleteUserConfirmationModal(userId: string): void {
    const modalRef: ComponentRef<any> = this.modalService.create(
      {
        component: WarningModalComponent,
        inputs: {
          label: '',
          title: 'Please confirm deletion of this user',
          modalText: 'Are you sure you want to delete this user from the system?',
          cancelButton: {text: 'Cancel', type: ModalButtonType.secondary},
          submitButton: {text: 'Delete', type: ModalButtonType.danger}
        }
      });

    modalRef.onDestroy(() => {
      if (modalRef.instance.returnValue) {
        this.deleteUserFromDatabase(userId);
      }
    });
  }

  private async getAllUsers(): Promise<UserDTO[]> {
    return await this.userService.getAllUsers();
  }

  private async getAllHotels(): Promise<HotelDTO[]> {
    return await this.hotelService.getAllHotels();
  }

  private createTableHeaders(): TableHeaderItem[] {
    return [
      new TableHeaderItem({data: 'First name'}),
      new TableHeaderItem({data: 'Last name'}),
      new TableHeaderItem({data: 'E-Mail'}),
      new TableHeaderItem({data: 'Hotel name'}),
      new TableHeaderItem()
    ];
  }

  private createTableData(): TableItem[][] {
    const tableData: TableItem[][] = [];

    this.users?.forEach((user) => {
      if (user) {
        tableData.push([
          new TableItem({data: user.firstname}),
          new TableItem({data: user.lastname}),
          new TableItem({data: user.email}),
          new TableItem({data: this.getHotelNameForHotelId(user.hotelId)}),
          new TableItem({data: {id: user.id}, template: undefined})
        ]);
      }
    });

    return tableData;
  }

  private getHotelNameForHotelId(hotelId: string): any {
    return this.hotels?.filter((hotel) => hotel.id === hotelId).map((hotel) => hotel.name)[0];
  }

  private async deleteUserFromDatabase(userId: string): Promise<any> {
    await this.userService.deleteUser(userId);

    this.users = await this.getAllUsers();
    this.hotels = await this.getAllHotels();
    this.tableData = this.createTableData();
  }
}
