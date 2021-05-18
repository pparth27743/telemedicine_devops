import { HttpClient } from '@angular/common/http';
import { Component, OnInit, Renderer2, ViewChild } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { webrtcServerUrl } from 'src/environments/environment';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { WebrtcService } from 'src/app/services/webrtc.service';
import { listOfSpecialization } from 'src/app/shared/variables';
import { UsersService } from 'src/app/services/users.service';

const mediaConstraints = {
    audio: {
        echoCancellation: true
    },
    video: {
        width: {
            max: 1920,
            min: 426
        },
        height: {
            max: 1080,
            min: 240
        }
    }
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
    clientName;
    localStreams = [];
    instances = 0;
    peerConnections = {};
    roomId;
    clientId;
    audioMuted = [];
    videoMuted = [];
    newStream_audioEnabled = false;
    newStream_videoEnabled = false;
    ListHTMLElements = {};

    specializations = listOfSpecialization;
    doctors;
    objDoctors;  // namespace related to doctor is stored here

    prescription_details = "No Prescription :(";
    selected_doc_id;



    @ViewChild('room_id') el_room_id;
    @ViewChild('sec_details') el_sec_details;
    @ViewChild('sec_controls') el_sec_controls;
    @ViewChild('local_video_display') el_local_video_display;
    @ViewChild('remote_video_display') el_remote_video_display;

    constructor(private webrtcService: WebrtcService, private renderer: Renderer2, private modalService: NgbModal, private userService: UsersService) { }

    ngOnInit(): void { }

    open(content) {
        this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' });
    }

    getPrescription() {
        this.userService.getPrescription(this.selected_doc_id).subscribe(res => {
            const len = res['data'].length;
            if (len != 0) {
                this.prescription_details = res['data'][len - 1]['details'];
            }
        })
    }

    onChangeSpecialization(specialization) {
        this.userService.getDoctors(specialization).subscribe(res => {
            this.doctors = [];
            this.objDoctors = {};
            res['data'].forEach(doc => {
                const name = doc.firstName + ' ' + (doc.lastName ? doc.lastName : '');
                this.doctors.push({ value: doc.id, viewValue: name });
                this.objDoctors[doc.id] = doc.namespace_id;
            })
        });
    }

    // create NameSpace
    createNamespace(namespace_id) {
        this.webrtcService.createNamespace(namespace_id)
            .subscribe(
                async data => {
                    if (data['status'] === 200) {
                        // close spinner
                    }
                    else {
                        this.handleError(data['error'], "createNamespace->if else");
                    }
                },
                error => {
                    this.handleError(error, "createNamespace");
                }
            )
    }

    chekckAvailability(doc_id) {
        this.webrtcService.chekckAvailabilityOfDoctor(this.objDoctors[doc_id]).subscribe(res => {
            if (res['availability'] == false) {
                let askForWait = confirm("Doctor Unavailable. Do you wnat to wait ?")
                if (askForWait === true) {
                    this.createNamespace(this.objDoctors[doc_id]);
                    this.makeCall(doc_id);
                }
            }
            else {
                this.makeCall(doc_id);
            }
        });
    }

    async makeCall(doc_id) {
        this.selected_doc_id = doc_id;
        this.setupSocket(this.objDoctors[doc_id]);
        await this.createRoom();
        this.userService.addPatientToWaitList(doc_id, this.roomId).subscribe(res => {

        });
    }

    async createRoom() {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.clientName = currentUser['firstname'] + ' ' + (currentUser['lastname'] ? currentUser['lastname'] : '');
        const patient_id = currentUser['id'];


        // Get Room Id
        const data = await this.webrtcService.createRoom().toPromise();
        this.roomId = data['room-id'];
        await this.setLocalMedia(true, true);
        this.el_room_id.nativeElement.innerText = this.roomId;
        this.socket.emit('create', { 'room-id': this.roomId, 'client-name': this.clientName, 'client-id': this.clientId, 'patient_id' :patient_id });
        this.toggleButtonDisability(true);
    }

    async joinRoom() {
        // this.toggleButtonDisability(true);

        this.webrtcService.joinRoom(this.roomId)
            .subscribe(
                async data => {
                    if (data['status'] === 200) {
                        await this.setLocalMedia();
                        this.el_room_id.nativeElement.innerText = this.roomId;
                        this.socket.emit('join', { 'room-id': this.roomId, 'client-name': this.clientName, 'client-id': this.clientId });
                    }
                    else {
                        this.handleError(data['error'], "joinRoom->check room availability Backend call inside subscribe");
                    }
                },
                error => {
                    this.socket.close();
                    this.toggleButtonDisability(false);
                    this.handleError(error, "joinRoom->check room availability Backend call");
                }
            )
    }

    async addStream() {

        if (this.newStream_audioEnabled || this.newStream_videoEnabled) {
            const instance = this.instances;
            try {
                await this.setLocalMedia(this.newStream_audioEnabled, this.newStream_videoEnabled);
                if (Object.keys(this.peerConnections).length !== 0) {
                    Object.keys(this.peerConnections).forEach((key) => {
                        this.localStreams[instance].getTracks().forEach((track) => {
                            this.peerConnections[key].pc.addTrack(track, this.localStreams[instance]);
                        });
                        this.createOffer(key);
                    });
                }
            }
            catch (error) {
                this.handleError(error), "addStream";
            }
        }
        else {
            console.log('Select Atleast one device !');
        }
        this.newStream_audioEnabled = false;
        this.newStream_videoEnabled = false;
    }

    toggleButtonDisability(disable) {
        if (disable === true) {
            this.el_sec_details.nativeElement.style.display = 'none';
            this.el_sec_controls.nativeElement.style.display = 'block';
        }
        else {
            this.el_sec_details.nativeElement.style.display = 'block';
            this.el_sec_controls.nativeElement.style.display = 'none';
        }
    }

    getSelectDeviceOptions(videoEnabled, audioEnabled, instance) {
        const selectAudio = this.renderer.createElement('select');
        const selectVideo = this.renderer.createElement('select');

        selectAudio.setAttribute('id', 'audio-source-' + instance);
        selectVideo.setAttribute('id', 'video-source-' + instance);

        selectAudio.classList.add('form-control', 'mb-2');
        selectVideo.classList.add('form-control', 'mb-2');

        selectAudio.disabled = !audioEnabled;
        selectVideo.disabled = !videoEnabled;

        selectAudio.addEventListener('change', (changeEvent) => { this.changeDevice(changeEvent) });
        selectVideo.addEventListener('change', (changeEvent) => { this.changeDevice(changeEvent) });

        this.ListHTMLElements['audio-source-' + instance] = selectAudio;
        this.ListHTMLElements['video-source-' + instance] = selectVideo;

        return [selectAudio, selectVideo];
    }

    getVideoMetaData(videoTag, videoId, videoInstance = null) {
        return {
            'video-tag': videoTag,
            'video-id': videoId,
            'video-instance': videoInstance
        };
    }

    getVideoConstraints(autoplay, muted, local, playsInLine, videoEnabled = true, audioEnabled = true) {
        return {
            'autoplay': autoplay,
            'muted': muted,
            'local': local,
            'playsInLine': playsInLine,
            'video-enabled': videoEnabled,
            'audio-enabled': audioEnabled
        };
    }

    getLabelElement(labelText, labelFor) {
        const parentDiv = this.renderer.createElement('div');
        const labelElement = this.renderer.createElement('label');

        parentDiv.classList.add('text-center');

        labelElement.setAttribute('for', labelFor);
        labelElement.innerText = labelText;

        parentDiv.appendChild(labelElement);

        return parentDiv;
    }

    getControlsDiv(instance, audioEnabled, videoEnabled) {
        const controlsDiv = this.renderer.createElement('div');
        controlsDiv.classList.add('controls');

        if (audioEnabled === true) {
            const toggleMicrophone = this.renderer.createElement('i');
            toggleMicrophone.setAttribute('id', 'mic-' + instance);
            toggleMicrophone.classList.add('fas', 'fa-microphone');
            toggleMicrophone.addEventListener('click', (audioControlElement) => { this.onClickAudioControl(audioControlElement) });
            controlsDiv.appendChild(toggleMicrophone);
        }
        if (videoEnabled === true) {
            const toggleVideo = this.renderer.createElement('i');
            toggleVideo.setAttribute('id', 'vid-' + instance);
            toggleVideo.classList.add('fas', 'fa-video', 'ml-5');
            toggleVideo.addEventListener('click', (videoControlElement) => { this.onClickVideoControl(videoControlElement) });
            controlsDiv.appendChild(toggleVideo);
        }
        controlsDiv.addEventListener('mouseover', () => {
            controlsDiv.style.display = 'block';
        });

        controlsDiv.addEventListener('mouseout', () => {
            controlsDiv.style.display = 'none';
        });

        return controlsDiv;
    }

    getVideoElement(videoMetaData, constraints, display = true) {
        const parentDiv = this.renderer.createElement('div');
        const videoElement = this.renderer.createElement('video');

        parentDiv.classList.add('col-md-4');

        if (display === false) {
            parentDiv.style.display = 'none';
        }

        let videoId = videoMetaData['video-id'];
        let id = videoId;

        if (videoMetaData['video-instance'] !== null) {
            videoId = videoId + '~' + videoMetaData['video-instance'];
        }

        videoElement.setAttribute('id', videoId);
        videoElement.playsInline = constraints['playsInline'];
        videoElement.muted = constraints['muted'];
        videoElement.autoplay = constraints['autoplay'];

        if (this.ListHTMLElements[id] == undefined) {
            this.ListHTMLElements[id] = [];
        }

        this.ListHTMLElements[id].push(videoElement);

        if (constraints['local'] === true) {
            const controlsDiv = this.getControlsDiv(videoMetaData['video-instance'], constraints['audio-enabled'], constraints['video-enabled']);

            videoElement.classList.add('transformX');

            parentDiv.addEventListener('mouseover', () => {
                controlsDiv.style.display = 'block';
            });

            parentDiv.addEventListener('mouseout', () => {
                controlsDiv.style.display = 'none';
            });

            const selections = this.getSelectDeviceOptions(constraints['video-enabled'], constraints['audio-enabled'],
                videoMetaData['video-instance']);

            parentDiv.appendChild(selections[0]);
            parentDiv.appendChild(selections[1]);
            parentDiv.appendChild(controlsDiv);
        }

        parentDiv.appendChild(videoElement);
        parentDiv.appendChild(this.getLabelElement(videoMetaData['video-tag'], videoElement.id));

        if (constraints['local'] === true) {
            this.el_local_video_display.nativeElement.appendChild(parentDiv);
        }
        else {
            this.el_remote_video_display.nativeElement.appendChild(parentDiv);
        }

        return videoElement;
    }

    onClickAudioControl(audioControlElement) {
        const index = audioControlElement.target.id.split('-')[1];
        if (this.audioMuted[index]) {
            this.audioMuted[index] = false;
            this.localStreams[index].getAudioTracks()[0].enabled = true;
            audioControlElement.target.classList.replace('fa-microphone-slash', 'fa-microphone');
        }
        else {
            this.audioMuted[index] = true;
            this.localStreams[index].getAudioTracks()[0].enabled = false;
            audioControlElement.target.classList.replace('fa-microphone', 'fa-microphone-slash');
        }
    }

    onClickVideoControl(videoControlElement) {
        const index = videoControlElement.target.id.split('-')[1];
        if (this.videoMuted[index]) {
            this.videoMuted[index] = false;
            this.localStreams[index].getVideoTracks()[0].enabled = true;
            videoControlElement.target.classList.replace('fa-video-slash', 'fa-video');
        }
        else {
            this.videoMuted[index] = true;
            this.localStreams[index].getVideoTracks()[0].enabled = false;
            videoControlElement.target.classList.replace('fa-video', 'fa-video-slash');
        }
    }

    endCall() {
        this.localStreams.forEach((stream) => {
            stream.getTracks().forEach((track) => {
                track.stop();
            });
        });

        this.localStreams = []

        Object.keys(this.peerConnections).forEach((key) => {
            delete this.peerConnections[key];
        });

        this.peerConnections = {};

        this.toggleButtonDisability(false);
        this.el_room_id.nativeElement.innerText = 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx';

        const localVideosDiv = this.el_local_video_display.nativeElement;
        const remoteVideosDiv = this.el_remote_video_display.nativeElement;

        while (localVideosDiv.firstChild) {
            localVideosDiv.removeChild(localVideosDiv.lastChild);
        }

        while (remoteVideosDiv.firstChild) {
            remoteVideosDiv.removeChild(remoteVideosDiv.lastChild);
        }

        this.clientId = '';
        this.roomId = '';
        this.instances = 0;
        this.socket.close();
        this.socket = null;
    }

    async setLocalMedia(audioEnabled = true, videoEnabled = true) {
        const userMediaConstraints = {};
        let tempStream;

        if (audioEnabled === true) {
            userMediaConstraints['audio'] = mediaConstraints['audio'];
        }
        if (videoEnabled === true) {
            userMediaConstraints['video'] = mediaConstraints['video'];
        }

        try {
            tempStream = await navigator.mediaDevices.getUserMedia(userMediaConstraints);
        }
        catch (error) {
            this.handleError(error, "setLocalMedia->localStream try catch");
        }

        if (tempStream) {
            this.localStreams.push(tempStream);
            const videoMetaData = this.getVideoMetaData(this.clientName, this.clientId, this.instances);
            const videoConstraints = this.getVideoConstraints(true, true, true, true, videoEnabled, audioEnabled);
            const videoElement = this.getVideoElement(videoMetaData, videoConstraints);

            await navigator.mediaDevices.enumerateDevices().then((deviceInfos) => {
                this.gotDevices(deviceInfos, [this.ListHTMLElements['audio-source-' + this.instances],
                this.ListHTMLElements['video-source-' + this.instances]], this.instances);
            }).catch();

            videoElement.srcObject = this.localStreams[this.instances];
            this.audioMuted.push(false);
            this.videoMuted.push(false);
            this.instances++;
        }
    }

    async setUpConnection(peerId, peerName, initiateCall = false) {
        this.peerConnections[peerId] = { 'peer-name': peerName, 'pc': new RTCPeerConnection(iceServers) };
        this.peerConnections[peerId].pc.ontrack = (track) => { this.setRemoteStream(track, peerId, peerName); };
        this.addLocalStreamTracks(peerId);
        this.peerConnections[peerId].pc.onicecandidate = (iceCandidate) => { this.gatherIceCandidates(iceCandidate, peerId); };

        if (initiateCall === true) {
            await this.createOffer(peerId);
        }
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

    addLocalStreamTracks(peerId) {
        this.localStreams.forEach((stream) => {
            if (stream) {
                stream.getTracks().forEach((track) => {
                    this.peerConnections[peerId].pc.addTrack(track, stream);
                });
            }
        });
    }

    async setRemoteStream(trackEvent, peerId, peerName) {

        let vidElements = this.ListHTMLElements[peerId];
        if (vidElements === undefined) {
            vidElements = [];
        }

        const length = vidElements.length;
        let videoElement = vidElements[length - 1];
        const nextIndex = videoElement ? Number(vidElements[length - 1].id.split('~')[1]) + 1 : 0;

        if ((videoElement) && (videoElement.srcObject.id === trackEvent.streams[0].id)) {
            videoElement.srcObject = trackEvent.streams[0];
        }
        else {
            const videoMetaData = this.getVideoMetaData(peerName, peerId, nextIndex);
            const constraints = this.getVideoConstraints(true, false, false, true);
            videoElement = this.getVideoElement(videoMetaData, constraints);
            videoElement.srcObject = trackEvent.streams[0];
        }
    }

    gatherIceCandidates(iceCandidate, peerId) {
        if (iceCandidate.candidate != null) {
            this.socket.emit('ice-candidate', { 'ice-candidate': iceCandidate.candidate, 'room-id': this.roomId, 'client-id': this.clientId, 'peer-id': peerId });
        }
    }

    // Changing Input Sources Functions
    changeDevice(changeEvent) {
        const index = changeEvent.target.id.split('-')[2];
        const userMediaConstraints = {};

        if (this.localStreams[index]) {
            this.localStreams[index].getTracks().forEach(track => {
                track.stop();
            });
        }

        const audioSource = this.ListHTMLElements['audio-source-' + index];
        const videoSource = this.ListHTMLElements['video-source-' + index];

        userMediaConstraints['audio'] = mediaConstraints['audio'];
        userMediaConstraints['audio']['deviceId'] = audioSource.value ? { exact: audioSource.value } : undefined;
        userMediaConstraints['video'] = mediaConstraints['video'];
        userMediaConstraints['video']['deviceId'] = videoSource.value ? { exact: videoSource.value } : undefined;

        navigator.mediaDevices.getUserMedia(userMediaConstraints).then((updatedStream) => {
            return this.gotStream(updatedStream, index);
        }).then((deviceInfo) => {
            this.gotDevices(deviceInfo, [audioSource, videoSource], index);
        }).catch();
    }

    gotStream(updatedStream, index) {
        const ids = [];

        this.localStreams[index].getTracks().forEach((track) => {
            ids.push(track.id);
        });

        const videoElement = this.ListHTMLElements[this.clientId][index];
        this.localStreams[index] = updatedStream;
        videoElement.srcObject = this.localStreams[index];
        this.changeTracks(ids, index);
        return navigator.mediaDevices.enumerateDevices();
    }

    changeTracks(ids, index) {
        if (Object.keys(this.peerConnections).length !== 0) {
            Object.keys(this.peerConnections).forEach((key) => {
                this.peerConnections[key].pc.getSenders().forEach((sender) => {
                    ids.forEach((id) => {
                        if (sender.track.id === id) {
                            if (sender.track.kind === 'audio') {
                                sender.replaceTrack(this.localStreams[index].getAudioTracks()[0]);
                            }
                            else if (sender.track.kind === 'video') {
                                sender.replaceTrack(this.localStreams[index].getVideoTracks()[0]);
                            }
                        }
                    });
                });
            });
        }
    }

    gotDevices(deviceInfos, selectors, index) {
        // Handles being called several times to update labels. Preserve values.
        const values = selectors.map(select => select.value);
        selectors.forEach(select => {
            while (select.firstChild) {
                select.removeChild(select.firstChild);
            }
        });
        for (let i = 0; i !== deviceInfos.length; ++i) {
            const deviceInfo = deviceInfos[i];

            const option = this.renderer.createElement('option');
            option.value = deviceInfo.deviceId;
            if (deviceInfo.kind === 'audioinput') {
                option.text = deviceInfo.label || `microphone ${this.ListHTMLElements['audio-source-' + index].length + 1}`;
                this.ListHTMLElements['audio-source-' + index].appendChild(option);
            } else if (deviceInfo.kind === 'videoinput') {
                option.text = deviceInfo.label || `camera ${this.ListHTMLElements['video-source-' + index].length + 1}`;
                this.ListHTMLElements['video-source-' + index].appendChild(option);
            }
        }
        selectors.forEach((select, selectorIndex) => {
            if (Array.prototype.slice.call(select.childNodes).some(n => n.value === values[selectorIndex])) {
                select.value = values[selectorIndex];
            }
        });
    }

    // Socket Functions
    setupSocket(namespace_id) {
        this.socket = io(`${webrtcServerUrl}/${namespace_id}`);
        this.socket.on('connect', () => { this.onConnect() });
        this.socket.on('room-joined', (data) => { this.onRoomJoined(data) });
        this.socket.on('ice-candidate', (data) => { this.onIceCandidate(data) });
        this.socket.on('send-metadata', (data) => { this.onMetaData(data) });
        this.socket.on('offer', (data) => { this.onOffer(data) });
        this.socket.on('answer', (data) => { this.onAnswer(data) });
        this.socket.on('client-disconnected', (data) => { this.onClientDisconnected(data) });
    }

    onConnect() {
        this.clientId = this.socket.id;
    }

    async onRoomJoined(data) {
        this.socket.emit('send-metadata', { 'room-id': this.roomId, 'client-name': this.clientName, 'client-id': this.clientId, 'peer-id': data['client-id'] });
        await this.setUpConnection(data['client-id'], data['client-name'], true);
    }

    async onMetaData(data) {
        if (data['peer-id'] === this.clientId) {
            try {
                await this.setUpConnection(data['client-id'], data['client-name']);
            }
            catch (error) {
                this.handleError(error, "onMetaData");
            }
        }
    }

    async onIceCandidate(data) {
        if (data['peer-id'] === this.clientId) {
            try {
                await this.peerConnections[data['client-id']].pc.addIceCandidate(new RTCIceCandidate(data['ice-candidate']));
            }
            catch (error) {
                this.handleError(error, "onIceCandidate");
            }
        }
    }

    async onOffer(data) {
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
    }

    async onAnswer(data) {
        if (data['peer-id'] === this.clientId) {
            try {
                await this.peerConnections[data['client-id']].pc.setRemoteDescription(new RTCSessionDescription(data['answer-sdp']));
            }
            catch (error) {
                this.handleError(error, "onAnswer");
            }
        }
    }

    onClientDisconnected(data) {
        if (this.peerConnections[data['client-id']]) {
            delete this.peerConnections[data['client-id']];
            const vidList = this.ListHTMLElements[data['client-id']];

            vidList.forEach((vidElement) => {
                vidElement.srcObject = null;
                vidElement.parentElement.remove();
            });

            this.userService.removePatientFromWaitlist(this.roomId).subscribe(res => {
                if (res['success']) {

                }
                else {
                    console.log("Could not remove.");
                }
            });
        }
    }


    // Error Functions
    handleError(error, from = undefined) {
        console.error(`An Error Occurred from : ${from} :: `, error);
    }

}
