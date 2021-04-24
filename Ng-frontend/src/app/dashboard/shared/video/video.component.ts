import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
// import { SocketService } from 'src/app/services/socket.service';

const mediaConstraints = {
  audio: {
    echoCancellation: true
  },
  video: true,
  // audio: true,
  // video: { width: 720, height: 540 }

};

@Component({
  selector: 'app-video',
  templateUrl: './video.component.html',
  styleUrls: ['./video.component.css']
})
export class VideoComponent implements AfterViewInit, OnDestroy {

  private localStream: MediaStream;
  @ViewChild('localVideo') localVideo: ElementRef;

  constructor() { }

  ngAfterViewInit(): void {
    this.setLocalMedia();
  }


  ngOnDestroy(): void {
    this.localStream = null;

  }

  private async setLocalMedia() {
    // this.localStream = await navigator.mediaDevices.getUserMedia(mediaConstraints);
    // this.localVideo.nativeElement.srcObject = this.localStream;
    // console.log(this.socketService.data);
  }

}
