import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthServiceService } from 'src/app/services/auth-service.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  constructor() { 
    
    // const user = localStorage.getItem('currentUser');
    // this.authService.validate().subscribe(result => {
    //   if(result.validtoken === 0) {
    //     this.authService.logout();
    //     this.router.navigate(['login']);
    //   }
    // });

  }

  ngOnInit(): void {
  }

}
