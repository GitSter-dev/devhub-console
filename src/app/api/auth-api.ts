import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ApiEnvelope, unwrap } from './envelope';
import { CurrentUser, TokenPair } from './models';

@Injectable({ providedIn: 'root' })
export class AuthApi {
  private readonly http = inject(HttpClient);

  login(identifier: string, password: string) {
    return this.http
      .post<ApiEnvelope<TokenPair>>('/auth/login', { identifier, password })
      .pipe(unwrap());
  }

  logout(refreshToken: string) {
    return this.http.post<ApiEnvelope<void>>('/auth/logout', { refreshToken }).pipe(unwrap());
  }

  me() {
    return this.http.get<ApiEnvelope<CurrentUser>>('/users/me').pipe(unwrap());
  }
}
