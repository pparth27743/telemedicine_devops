import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';


@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {


  details: FormGroup;
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
    this.initForm();
  }

  initForm (){
    this.details = new FormGroup({
      first_name: new FormControl(this.firstname, Validators.required),
      last_name: new FormControl(this.lastname, Validators.required),
      email: new FormControl(this.email, Validators.required),
    });
  }

 
}
