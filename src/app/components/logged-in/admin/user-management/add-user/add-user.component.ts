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

import {AfterViewInit, Component, ViewChild} from '@angular/core';
import {HotelService} from 'src/app/services/hotel/hotel.service';
import {Router} from '@angular/router';
import {UserCreationDTO} from 'src/api-client';
import {ApplicationURL} from 'src/app/utilities/application-url';
import {UserService} from 'src/app/services/user/user.service';
import {ErrorTypeDeterminer} from 'src/app/utilities/error-type-determiner/error-type-determiner';
import {BadRequestError} from 'src/app/models/BadRequestError';
import {UserFormComponent} from '../user-form/user-form.component';
import {ListItem} from 'carbon-components-angular';
import {FormValidator} from '../../../../../utilities/form-validators/form-validator';

enum AddUserBadRequestError {
  NotUnique = 'A user with the given login already exists.'
}

@Component({
  selector: 'app-add-user',
  templateUrl: './add-user.component.html',
  styleUrls: ['./add-user.component.scss']
})
export class AddUserComponent implements AfterViewInit {
  public genericErrorNotificationVisible: boolean = false;

  @ViewChild(UserFormComponent)
  private readonly userFormComponent?: UserFormComponent;

  public constructor(private readonly formValidator: FormValidator,
                     private readonly hotelService: HotelService,
                     private readonly userService: UserService,
                     private readonly router: Router) {
  }

  public async ngAfterViewInit(): Promise<void> {
    try {
      let hotels = await this.getHotels();
      hotels = this.sortHotelsAlphabetically(hotels);

      this.userFormComponent!.hotels = hotels;
      this.userFormComponent!.filteredHotels = hotels;
    } catch (error: any) {
      this.genericErrorNotificationVisible = true;
    }
  }

  public async submitAddUser(): Promise<void> {
    if (this.userFormComponent!.userForm.valid) {
      const userCreationDTO = this.createUserCreationDTO();

      try {
        await this.userService.createUser(userCreationDTO);

        this.router.navigateByUrl(ApplicationURL.AdminUserManagement);
      } catch (httpErrorResponse: any) {
        this.handleErrorResponse(httpErrorResponse);
      }
    }
  }

  public discard(): void {
    this.userFormComponent!.userForm.reset();

    this.router.navigateByUrl(ApplicationURL.AdminUserManagement);
  }

  public closeErrorNotification(): void {
    this.genericErrorNotificationVisible = false;
  }

  private async getHotels(): Promise<ListItem[]> {
    return (await this.hotelService.getAllHotels()).map((hotel) => {
      return {
        content: hotel.name,
        id: hotel.id,
        selected: false
      };
    });
  }

  private sortHotelsAlphabetically(hotels: ListItem[]): ListItem[] {
    return hotels.sort((hotel1, hotel2) => {
      return hotel1.content.localeCompare(hotel2.content);
    });
  }

  private createUserCreationDTO(): UserCreationDTO {
    const userFormValues = this.formValidator.getSanitizedRawFormValues(this.userFormComponent!.userForm);

    return {
      login: userFormValues.login,
      firstname: userFormValues.firstName,
      lastname: userFormValues.lastName,
      email: userFormValues.email,
      hotelId: userFormValues.hotel.id,
      password: userFormValues.password
    };
  }

  private handleErrorResponse(httpErrorResponse: any): void {
    if (ErrorTypeDeterminer.isHttpErrorResponse(httpErrorResponse) &&
      ErrorTypeDeterminer.isErrorTypeBadRequest(httpErrorResponse.error)) {
      this.handleBadRequestError(httpErrorResponse.error);
    } else {
      this.genericErrorNotificationVisible = true;
    }
  }

  private handleBadRequestError(badRequestError: BadRequestError): void {
    if (badRequestError.detail.includes(AddUserBadRequestError.NotUnique)) {
      this.userFormComponent!.userForm.get('login')!.setErrors({'not-unique': true});
    }
  }
}
