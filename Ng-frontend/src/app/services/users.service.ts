import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { baseUrl } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UsersService {

  constructor(private http:HttpClient) { }

  update(data):Observable<any> {
    return this.http.patch(`${baseUrl}users/`, data)
    .pipe(map(data => {
      console.log();
      // localStorage.setItem('currentUser', JSON.stringify(data['currentUser']));
      return data;
    }));
  }


}
