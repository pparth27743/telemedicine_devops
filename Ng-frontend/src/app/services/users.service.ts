import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { baseUrl } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UsersService {

  constructor(private http: HttpClient) { }

  update(data): Observable<any> {
    return this.http.patch(`${baseUrl}users/`, data)
      .pipe(map(data => {
        return data;
      }));
  }

  getDoctors(specialization) {
    return this.http.post(`${baseUrl}users/getdoctors/`, { 'specialization': specialization });
  }

  getWaitingPatients(doctor_id){
    return this.http.post(`${baseUrl}users/getwaitingpatients/`, { 'doctor_id': doctor_id });
  }

  removePatientFromWaitlist(patient_room_id){
    return this.http.post(`${baseUrl}users/removefromwaitlist/`, { 'room_id' : patient_room_id });
  }

  addPatientToWaitList(doctor_id, roomId){
      const currentUser = JSON.parse(localStorage.getItem('currentUser'));
      const patient_id = currentUser['id'];
      return this.http.post(`${baseUrl}users/addtowaitlist/`, { 'doctor_id': doctor_id, 'patient_id' : patient_id, 'room_id' : roomId });
  }

}
