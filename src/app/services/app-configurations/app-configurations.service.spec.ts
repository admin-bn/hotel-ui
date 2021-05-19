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

import {TestBed} from '@angular/core/testing';
import {AppConfigurationsService} from './app-configurations.service';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';

describe('AppConfigurationsService', () => {
  let appConfigurationsService: AppConfigurationsService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AppConfigurationsService],
      imports: [HttpClientTestingModule]
    });

    appConfigurationsService = TestBed.inject(AppConfigurationsService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(appConfigurationsService).toBeTruthy();
  });

  it('should set the hotel name configuration to value returned by the http get request', async () => {
    const appConfigurations = {
      hotelName: 'bee-hotel-test'
    };
    const loadConfigurations = appConfigurationsService.loadConfigurations();
    const req = httpTestingController.expectOne('configurations.json');

    expect(req.request.method).toEqual('GET');
    req.flush({
      payload: Object.values(appConfigurations)
    });

    await loadConfigurations;

    expect(appConfigurations.hotelName).toEqual(appConfigurations.hotelName);
  });
});
