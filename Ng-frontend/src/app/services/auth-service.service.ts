import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { baseUrl } from 'src/environments/environment';
import { map } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class AuthServiceService {

  private currentUserSubject: BehaviorSubject<any>;
  public currentUser: Observable<any>;

  constructor(private http:HttpClient) { 
    this.currentUserSubject = new BehaviorSubject(JSON.parse(localStorage.getItem('currentUser')));
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get getcurrentUser() {
    return this.currentUserSubject.value;
  }

  login(data):Observable<any> {
    return this.http.post(`${baseUrl}users/login`, data)
    .pipe(map(data => {
      localStorage.setItem('currentUser', JSON.stringify(data['currentUser']));
      return data;
    }));
  }

  signup(data):Observable<any> {
    return this.http.post(`${baseUrl}users/signup`, data);
  }

  logout() {
    // remove user from local storage and set current user to null
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }

}
    