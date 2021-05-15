import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { webrtcServerUrl } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class WebrtcService {

  constructor(private http: HttpClient) { }

  createRoom() {
    return this.http.get(`${webrtcServerUrl}/createRoom`);
  }

  joinRoom(roomId) {
    return this.http.get(`${webrtcServerUrl}/joinRoom?roomId=${roomId}`);
  }

  createNamespace(namespace_id) {
    return this.http.get(`${webrtcServerUrl}/createNamespace?namespace_id=${namespace_id}`);
  }

  removeNamespace(namespace_id) {
    return this.http.get(`${webrtcServerUrl}/removeNamespace?namespace_id=${namespace_id}`);
  }

}
