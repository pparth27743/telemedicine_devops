import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { AuthServiceService } from 'src/app/services/auth-service.service';
import { WebrtcService } from 'src/app/services/webrtc.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  @Output() toggleSideBar: EventEmitter<any> = new EventEmitter();

  constructor(private authService: AuthServiceService, private router: Router, private webrtcService: WebrtcService) { }

  ngOnInit(): void {
     // create namespace_id
     const currentUser = JSON.parse(localStorage.getItem('currentUser'));
     if (currentUser['role'] === 'Doctor') {
       this.createNamespace(currentUser['namespace_id']);
     } 
  }

  togglingSideBar() {
    this.toggleSideBar.emit();
    setTimeout(() => {
      window.dispatchEvent(
        new Event('resize')
      );
    }, 200);
  }

  // Error Functions
  handleError(error, from = undefined) {
    console.error(`An Error Occurred from : ${from} :: `, error);
  }

  // create NameSpace
  createNamespace(namespace_id){
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

  // remove NameSpace
  removeNamespace(namespace_id) {
    this.webrtcService.removeNamespace(namespace_id)
      .subscribe(
        data => {
          if (data['status'] === 200) {

          }
          else {
            this.handleError(data['error'], "removeNamespace->if else");
          }
        },
        error => {
          this.handleError(error, "removeNamespace");
        }
      )
  }


  signout() {
    // remove namespace_id
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser['role'] === 'Doctor') {
      this.removeNamespace(currentUser['namespace_id']);
    }

    this.authService.logout();
    location.reload();
    this.router.navigate(['']);
  }

}
