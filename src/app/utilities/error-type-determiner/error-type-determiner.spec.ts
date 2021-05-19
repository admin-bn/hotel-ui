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

import {ErrorTypeDeterminer} from './error-type-determiner';
import {HttpErrorResponse} from '@angular/common/http';

describe('ErrorTypeDeterminer', () => {
  it('isHttpErrorResponse should return true if given HttpErrorResponse', () => {
    const httpErrorResponse = new HttpErrorResponse({
      error: 'any',
      status: 400,
      statusText: 'Something went wrong',
      url: 'test-url.com'
    });

    expect(ErrorTypeDeterminer.isHttpErrorResponse(httpErrorResponse)).toBeTrue();
  });

  it('isErrorTypeBadRequest should return true if given error object with Bad Request type', () => {
    const errorBadRequest = {
      type: 'https://www.jhipster.tech/problem/problem-with-message',
      title: 'Bad Request',
      status: 400,
      detail: `400 BAD_REQUEST "A user with the given login already exists."`,
      path: '/api/users',
      message: 'error.http.40'
    };

    expect(ErrorTypeDeterminer.isErrorTypeBadRequest(errorBadRequest)).toBeTrue();
  });
});
