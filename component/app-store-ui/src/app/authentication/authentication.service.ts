
import { map } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ApiEndpoints } from '../config/api.endpoints';

import { LoginFormData, LoginResponseData, LogoutResponseData, ClientRegParam, RegClientData, TokenGenerationParam, TokenData } from './authentication.models';
import { AppState } from '../app.data.models';
import { Store } from '@ngrx/store';
import { SigUpUserParam, ResetPasswordParam } from './authentication.data.models';

@Injectable()
export class AuthenticationService {

    private loginData: LoginResponseData;
    private clientAuthData: RegClientData;

    constructor(private http: HttpClient, private store: Store<AppState>) {
        this.store.select((s) => s.authentication.loginData).subscribe((auth) => {
            this.loginData = auth;
        })

        this.store.select((s) => s.authentication.registeredAppData).subscribe((regAppData) => {
            this.clientAuthData = regAppData;
        })
    }

    login(param: LoginFormData): Observable<LoginResponseData> {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            })
        };

        return this.http.post(ApiEndpoints.authentication.login, param, httpOptions).pipe(
            map((data: any) =>
                new LoginResponseData(data.error, data.message)
            ));
    }

    logout(): Observable<LogoutResponseData> {
        const body: HttpParams = new HttpParams()
            .set('action', 'logout');

        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/x-www-form-urlencoded'
            })
        };

        return this.http.get(ApiEndpoints.authentication.logout, httpOptions).pipe(
            map((data: any) => new LogoutResponseData(data)));
    }

    signup(param: SigUpUserParam) {
        return this.http.get(ApiEndpoints.authentication.signup);
    }

    changePassword(param: ResetPasswordParam) {
        return this.http.get(ApiEndpoints.authentication.changePassword);
    }

    isLoggedIn() {
        return !!this.loginData;
    }

    clientAppRegistration(param: ClientRegParam) {
        param.callbackUrl = 'www.google.lk';
        param.clientName = 'admin';
        param.owner = 'admin';
        param.grantType = 'password refresh_token';
        param.saasApp = true;

        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                'Authorization': 'Basic YWRtaW46YWRtaW4='
            })
        };

        return this.http.post<RegClientData>(
            ApiEndpoints.authentication.clientRegistration, param,
            httpOptions
        );
    }


    tokenGeneration(param: TokenGenerationParam) {
        param.grant_type = 'password';
        param.scope = 'apim:subscribe';
        param.username = 'admin';
        param.password = 'admin';

        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': 'Basic ' + btoa(this.clientAuthData.clientId + ':' + this.clientAuthData.clientSecret)
            })
        };
        return this.http.post<TokenData>(
            ApiEndpoints.authentication.tokenGeneration, param,
            httpOptions
        );
    }

}
