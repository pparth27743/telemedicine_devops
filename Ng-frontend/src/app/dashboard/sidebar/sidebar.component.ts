import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {

  firstname;
  lastname;
  email;

  constructor() { 
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.firstname = currentUser['firstname'];
    this.lastname = currentUser['lastname'];
    this.email = currentUser['email'];
  }

  ngOnInit(): void {
  }

}
