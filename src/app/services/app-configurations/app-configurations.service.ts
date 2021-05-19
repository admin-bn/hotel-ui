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

import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {AppConfigurations} from '../../config/app-configurations';

@Injectable({
  providedIn: 'root'
})
export class AppConfigurationsService {
  private readonly configurationsPath: string = 'configurations.json';

  public logoUrl?: string;
  public controllerAPIUrl?: string;
  public title?: string;

  public constructor(private readonly http: HttpClient) {
  }

  public async loadConfigurations(): Promise<void> {
    const configurations = await this.http.get<AppConfigurations>(this.configurationsPath).toPromise();

    this.logoUrl = configurations.SSIBK_HOTEL_UI_LOGO_URL || 'assets/pictograms/bee.svg';
    this.controllerAPIUrl = configurations.SSIBK_HOTEL_UI_CONTROLLER_APIURL || 'http://localhost:8090';
    this.title = configurations.SSIBK_HOTEL_UI_TITLE || 'SSIBK Hotel';
  }
}
