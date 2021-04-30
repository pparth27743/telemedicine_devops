import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, OnDestroy, OnInit, Renderer2, ViewChild } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { webrtcServerUrl } from 'src/environments/environment';


// const webrtcServerUrl = "http://localhost:4440";
// const webrtcServerUrl = "http://192.168.0.106:4440";


const mediaConstraints = {
  audio: {
    echoCancellation: true
  },
  video: true,
};

const iceServers = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    { urls: 'stun:stun4.l.google.com:19302' },
  ],
};


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {


  socket: Socket;
  createJoinRoomComponent: boolean = false;


  clientName;
  localStream;
  peerConnections = {};
  roomId;
  clientId;

  muteaudio = false;
  mutevideo = false;

  ListvideoElements = {};

  @ViewChild('clientname_text') el_clientname_text;
  @ViewChild('audio_input_source') el_audio_input_source;
  @ViewChild('video_input_source') el_video_input_source;
  @ViewChild('horizontal_row') el_horizontal_row;
  @ViewChild('div_select') el_div_select;
  @ViewChild('video_display') el_video_display;
  @ViewChild('room_id') el_room_id;
  @ViewChild('btn_join_room') el_btn_join_room;
  @ViewChild('btn_create_room') el_btn_create_room;
  @ViewChild('join_room_text') el_join_room_text;



  constructor(private http: HttpClient, private renderer: Renderer2) {
    this.getUniqueId();
  }


  // Socket Functions
  setupSocket() {
    this.socket = io(webrtcServerUrl);

    this.socket.on('room-joined', async (data) => {
      await this.setUpConnection(data['client-id'], data['client-name']);
      this.socket.emit('send-metadata', { 'room-id': this.roomId, 'client-name': this.clientName, 'client-id': this.clientId, 'peer-id': data['client-id'] });
    });

    this.socket.on('ice-candidate', async (data) => {
      if (data['peer-id'] === this.clientId) {
        try {
          await this.peerConnections[data['client-id']].pc.addIceCandidate(new RTCIceCandidate(data['ice-candidate']));
        }
        catch (error) {
          this.handleError(error, "onIceCandidate");
        }
      }
    });

    this.socket.on('send-metadata', async (data) => {
      if (data['peer-id'] === this.clientId) {
        try {
          await this.setUpConnection(data['client-id'], data['client-name'], true);
        }
        catch (error) {
          this.handleError(error, "onMetaData");
        }
      }
    });

    this.socket.on('offer', async (data) => {
      if (data['peer-id'] === this.clientId) {
        try {
          await this.peerConnections[data['client-id']].pc.setRemoteDescription(new RTCSessionDescription(data['offer-sdp']));
          const answer = await this.peerConnections[data['client-id']].pc.createAnswer();
          this.peerConnections[data['client-id']].pc.setLocalDescription(new RTCSessionDescription(answer));
          this.socket.emit('answer', { 'room-id': this.roomId, 'answer-sdp': answer, 'client-id': this.clientId, 'peer-id': data['client-id'] });
        }
        catch (error) {
          this.handleError(error, "onOffer");
        }
      }
    });

    this.socket.on('answer', async (data) => {
      if (data['peer-id'] === this.clientId) {
        try {
          await this.peerConnections[data['client-id']].pc.setRemoteDescription(new RTCSessionDescription(data['answer-sdp']));
        }
        catch (error) {
          this.handleError(error, "onAnswer");
        }
      }
    });

  }

  async getUniqueId() {
    this.http.get(`${webrtcServerUrl}/clientId`)
      .subscribe(
        data => {
          this.clientId = data['client-id']
        },
        error => this.handleError(error, "getUniqueId->clientId backend call")
      );
  }

  gotDevices(deviceInfos, selectors) {
    // Handles being called several times to update labels. Preserve values.
    const values = selectors.map(select => select.value);
    selectors.forEach(select => {
      while (select.firstChild) {
        select.removeChild(select.firstChild);
      }
    });
    for (let i = 0; i !== deviceInfos.length; ++i) {
      const deviceInfo = deviceInfos[i];
      const option = document.createElement('option');
      option.value = deviceInfo.deviceId;
      if (deviceInfo.kind === 'audioinput') {
        option.text = deviceInfo.label || `microphone ${this.el_audio_input_source.nativeElement.length + 1}`;
        this.el_audio_input_source.nativeElement.appendChild(option);
      } else if (deviceInfo.kind === 'videoinput') {
        option.text = deviceInfo.label || `camera ${this.el_video_input_source.nativeElement.length + 1}`;
        this.el_video_input_source.nativeElement.appendChild(option);
      }
    }
    selectors.forEach((select, selectorIndex) => {
      if (Array.prototype.slice.call(select.childNodes).some(n => n.value === values[selectorIndex])) {
        select.value = values[selectorIndex];
      }
    });
  }

  getVideoElement(element_id, instance, labelName, isLocalVideo = false) {
    const videoDisplayDiv = this.el_video_display.nativeElement;
    const innerDiv = this.renderer.createElement('div');
    this.renderer.setAttribute(innerDiv, 'class', 'col-md-4');

    const videoElement = this.renderer.createElement('video');
    this.renderer.setAttribute(videoElement, 'id', element_id + '-' + instance);
    this.renderer.setStyle(videoElement, 'width', '350px');
    this.renderer.setStyle(videoElement, 'height', '262px');
    this.renderer.setStyle(videoElement, 'objectFit', 'cover');
    this.ListvideoElements[element_id + '-0'] = videoElement;

    const labelDiv = this.renderer.createElement('div');
    this.renderer.setAttribute(labelDiv, 'class', 'text-center');

    const label = this.renderer.createElement('label');
    this.renderer.setAttribute(label, 'for', element_id + '-' + instance);
    const text = this.renderer.createText(labelName);
    this.renderer.appendChild(label, text);

    this.renderer.appendChild(labelDiv, label);
    this.renderer.appendChild(innerDiv, videoElement);
    this.renderer.appendChild(innerDiv, labelDiv);

    if (isLocalVideo === true) {
      const controlsDiv = this.renderer.createElement('div');
      controlsDiv.classList.add('text-center');
      controlsDiv.style.display = 'none';
      controlsDiv.setAttribute('id', 'controls-div');
      controlsDiv.style.zIndex = "1";
      controlsDiv.style.position = 'absolute';
      controlsDiv.style.backgroundColor = '#2921219e';
      controlsDiv.style.color = 'white';
      controlsDiv.style.marginLeft = '15px';
      controlsDiv.style.width = '351px';
      controlsDiv.style.fontSize = '40px';

      const toggleMicrophone = this.renderer.createElement('i');
      this.renderer.setAttribute(toggleMicrophone, "class", 'fas fa-microphone');

      const toggleVideo = this.renderer.createElement('i');
      this.renderer.setAttribute(toggleVideo, "class", 'fas fa-video ml-5');

      const disconnectCall = this.renderer.createElement('i');
      this.renderer.setAttribute(disconnectCall, "class", 'fas fa-phone-slash ml-5 redcontrol');
      disconnectCall.style.color = 'orangered';

      toggleMicrophone.addEventListener('click', (audioControlElement) => {
        if (this.muteaudio) {
          this.muteaudio = false;
          this.localStream.getAudioTracks()[0].enabled = true;
          audioControlElement.target.classList.replace('fa-microphone-slash', 'fa-microphone');
        }
        else {
          this.muteaudio = true;
          this.localStream.getAudioTracks()[0].enabled = false;
          audioControlElement.target.classList.replace('fa-microphone', 'fa-microphone-slash');
        }
      });

      toggleVideo.addEventListener('click', (videoControlElement) => {
        if (this.mutevideo) {
          this.mutevideo = false;
          this.localStream.getVideoTracks()[0].enabled = true;
          videoControlElement.target.classList.replace('fa-video-slash', 'fa-video');
        }
        else {
          this.mutevideo = true;
          this.localStream.getVideoTracks()[0].enabled = false;
          videoControlElement.target.classList.replace('fa-video', 'fa-video-slash');
        }
      });

      disconnectCall.addEventListener('click', (disconnectControlElement) => {
        this.localStream.getTracks().forEach((track) => {
          track.stop();
        });

        Object.keys(this.peerConnections).forEach((key) => {
          this.peerConnections[key].pc.ontrack = null;
          this.peerConnections[key].pc.onremovetrack = null;
          this.peerConnections[key].pc.onicecandidate = null;
          this.peerConnections[key].pc.oniceconnectionstatechange = null;
          this.peerConnections[key].pc.onsignalingstatechange = null;
          this.peerConnections[key].pc.onicegatheringstatechange = null;
          this.peerConnections[key].pc.onnegotiationneeded = null;
          this.peerConnections[key].pc.close();
          delete this.peerConnections[key];
        });

        this.peerConnections = {};
        this.ListvideoElements[this.clientId + '-0'].srcObject = null;
        let videoDisplayDiv = this.el_video_display.nativeElement;
        const containerDiv = videoDisplayDiv.parentNode;
        videoDisplayDiv.remove();
        videoDisplayDiv = this.renderer.createElement('div');
        this.renderer.setAttribute(videoDisplayDiv, "id", 'video-display');
        videoDisplayDiv.classList.add('row', 'mt-5');
        containerDiv.appendChild(videoDisplayDiv);

        this.el_btn_join_room.nativeElement.disabled = false;
        this.el_btn_create_room.nativeElement.disabled = false;
        this.el_room_id.nativeElement.disabled = false;
        this.el_horizontal_row.nativeElement.disabled = false;
        this.el_div_select.nativeElement.disabled = false;

        this.socket.close();

        // this.createJoinRoomComponent = !this.createJoinRoomComponent;
      });

      innerDiv.addEventListener('mouseover', (mouseOverEvent) => {
        controlsDiv.style.display = 'block';
      });

      innerDiv.addEventListener('mouseout', (mouseOutEvent) => {
        controlsDiv.style.display = 'none';
      });

      controlsDiv.addEventListener('mouseover', (mouseOverEvent) => {
        controlsDiv.style.display = 'block';
      });

      controlsDiv.addEventListener('mouseout', (mouseOutEvent) => {
        controlsDiv.style.display = 'none';
      })


      this.renderer.appendChild(controlsDiv, toggleMicrophone);
      this.renderer.appendChild(controlsDiv, toggleVideo);
      this.renderer.appendChild(controlsDiv, disconnectCall);


      videoDisplayDiv.appendChild(controlsDiv);
    }
    videoDisplayDiv.appendChild(innerDiv);

    return videoElement;
  }


  async setLocalMedia() {
    navigator.mediaDevices.enumerateDevices().then((deviceInfos) => {
      this.gotDevices(deviceInfos, [this.el_audio_input_source.nativeElement, this.el_video_input_source.nativeElement]);
    }).catch(error => this.handleError(error, "setLocalMedia->navigator.mediaDevices..."));

    try {
      this.localStream = await navigator.mediaDevices.getUserMedia(mediaConstraints);
    }
    catch (error) {
      this.handleError(error, "setLocalMedia->localStream try catch");
    }

    const localVideo = this.getVideoElement(this.clientId, 0, this.clientName, true);
    localVideo.autoplay = true;
    localVideo.muted = true;
    localVideo.playsInline = true;
    localVideo.srcObject = this.localStream;

    this.el_horizontal_row.nativeElement.hidden = false;
    this.el_div_select.nativeElement.hidden = false;

  }

  async createRoom() {
    this.setupSocket();
    this.clientName = this.el_clientname_text.nativeElement.value;

    // Get Room Id
    this.http.get(`${webrtcServerUrl}/createRoom`)
      .subscribe(
        async data => {
          this.roomId = data['room-id'];

          await this.setLocalMedia();
          this.el_room_id.nativeElement.innerText = this.roomId;
          this.el_btn_join_room.nativeElement.disabled = true;
          this.el_btn_create_room.nativeElement.disabled = true;

          this.socket.emit('join', { 'room-id': this.roomId });
        },
        error => {
          this.handleError(error, "createRoom->createRoom Backend call");
        }
      );

    // this.createJoinRoomComponent = !this.createJoinRoomComponent;
  }

  async joinRoom() {
    this.setupSocket();
    this.roomId = this.el_join_room_text.nativeElement.value;
    this.clientName = this.el_clientname_text.nativeElement.value;

    this.http.get(`${webrtcServerUrl}/joinRoom?roomId=${this.roomId}`)
      .subscribe(
        async data => {
          if (data['status'] === 200) {
            await this.setLocalMedia();
            this.el_room_id.nativeElement.innerText = this.roomId;
            this.el_btn_join_room.nativeElement.disabled = true;
            this.el_btn_create_room.nativeElement.disabled = true;

            this.socket.emit('join', { 'room-id': this.roomId, 'client-name': this.clientName, 'client-id': this.clientId });
          }
          else {
            this.handleError(data['error'], "joinRoom->check room availability Backend call inside subscribe");
          }
        },
        error => {
          this.handleError(error, "joinRoom->check room availability Backend call");
        }
      )

    // this.createJoinRoomComponent = !this.createJoinRoomComponent;
  }

  async setRemoteStream(track, peerId) {
    this.ListvideoElements[peerId + '-0'].srcObject = track.streams[0];
  }

  async addLocalStreamTracks(peerId) {
    this.localStream.getTracks().forEach((track) => {
      this.peerConnections[peerId].pc.addTrack(track, this.localStream);
    });
  }

  async gatherIceCandidates(iceCandidate, peerId) {
    if (iceCandidate.candidate != null) {
      this.socket.emit('ice-candidate', { 'ice-candidate': iceCandidate.candidate, 'room-id': this.roomId, 'client-id': this.clientId, 'peer-id': peerId });
    }
  }

  async checkPeerDisconnection(event, peerId) {
    let state = this.peerConnections[peerId].pc.iceConnectionState;

    if (state === 'failed' || state === 'closed' || state === 'disconnected') {
      delete this.peerConnections[peerId];
      const elementToDelete = document.getElementById(peerId + '-0').parentElement;
      elementToDelete.parentElement.removeChild(elementToDelete);
    }
  }

  async changeTracks() {
    if (Object.keys(this.peerConnections).length !== 0) {
      Object.keys(this.peerConnections).forEach(key => {
        this.peerConnections[key].pc.getSenders().forEach(sender => {
          if (sender.track.kind === 'audio') {
            sender.replaceTrack(this.localStream.getAudioTracks()[0]);
          }
          else if (sender.track.kind === 'video') {
            sender.replaceTrack(this.localStream.getVideoTracks()[0]);
          }
        });
      });
    }
  }

  async gotStream(updatedStream) {
    const videoElement = this.ListvideoElements[this.clientId + '-' + 0];
    this.localStream = updatedStream;
    videoElement.srcObject = this.localStream;
    this.changeTracks();
    return navigator.mediaDevices.enumerateDevices();
  }

  async changeDevice() {
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        track.stop();
      });
    }
    const audioSource = this.el_audio_input_source.nativeElement.value;
    const videoSource = this.el_video_input_source.nativeElement.value;
    const constraints = {
      audio: { deviceId: audioSource ? { exact: audioSource } : undefined },
      video: { deviceId: videoSource ? { exact: videoSource } : undefined }
    };

    navigator.mediaDevices.getUserMedia(constraints)
      .then(this.gotStream)
      .then((deviceInfo) => {
        this.gotDevices(deviceInfo, [this.el_audio_input_source.nativeElement, this.el_video_input_source.nativeElement]);
      }).catch(error => this.handleError(error, "changeDevice"));
  }

  async createOffer(peerId) {
    try {
      const offer = await this.peerConnections[peerId].pc.createOffer();
      await this.peerConnections[peerId].pc.setLocalDescription(offer);
      this.socket.emit('offer', { 'room-id': this.roomId, 'offer-sdp': offer, 'client-id': this.clientId, 'peer-id': peerId });
    }
    catch (error) {
      this.handleError(error, "createOffer");
    }
  }

  async setUpConnection(peerId, peerName, initiateCall = false) {
    const videoElement = this.getVideoElement(peerId, 0, peerName);
    videoElement.autoplay = true;
    // videoElement.muted = true;
    videoElement.playsInline = true;
    this.peerConnections[peerId] = { 'peer-name': peerName, 'pc': new RTCPeerConnection(iceServers) };
    this.peerConnections[peerId].pc.ontrack = (track) => { this.setRemoteStream(track, peerId); };
    this.addLocalStreamTracks(peerId);
    this.peerConnections[peerId].pc.onicecandidate = (iceCandidate) => { this.gatherIceCandidates(iceCandidate, peerId); };
    this.peerConnections[peerId].pc.oniceconnectionstatechange = (event) => { this.checkPeerDisconnection(event, peerId); };
    if (initiateCall === true) {
      await this.createOffer(peerId);
    }
  }

  // Error Functions
  handleError(error, from = undefined) {
    console.error(`An Error Occurred from : ${from} :: `, error);
  }


  ngOnInit(): void { }


  toggle() {
    this.createJoinRoomComponent = !this.createJoinRoomComponent;
  }

}
