import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthServiceService } from 'src/app/services/auth-service.service';
import { UsersService } from 'src/app/services/users.service';


@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {


  details: FormGroup;
  currentUser;
  firstname;
  lastname;
  email;
  id;

  constructor(private usersService: UsersService, private authService: AuthServiceService, private router: Router) {
    
    const user = localStorage.getItem('currentUser');
    this.authService.validate().subscribe(result => {
      // console.log(result.success);
      if(result.validtoken === 0) {
        localStorage.removeItem('currentUser');
        this.router.navigate(['/login']);
      }
    });

    if (user) {
      this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
      this.firstname = this.currentUser['firstname'];
      this.lastname = this.currentUser['lastname'];
      this.email = this.currentUser['email'];
      this.id = this.currentUser['id'];
    }
  }

  ngOnInit(): void {
    this.initForm();
  }

  initForm() {
    this.details = new FormGroup({
      firstname: new FormControl(this.firstname, Validators.required),
      lastname: new FormControl(this.lastname, Validators.required),
      email: new FormControl(this.email, Validators.required),
      id: new FormControl(this.id)
    });
  }

  updateProfile() {
    if (this.details.valid) {
      this.usersService.update(this.details.value).subscribe(result => {

        console.log(result);


        if (result.success == 1) {
          alert(result.message);
          this.currentUser.firstname = this.details.value.firstname;
          this.currentUser.lastname = this.details.value.lastname;
          this.currentUser.email = this.details.value.email;
          localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
        } else {
          alert(result.message);
          if (result.validtoken == 0) {
            localStorage.removeItem('currentUser');
            this.router.navigate(['/login']);
          }
        }
      })
    }
  }


}
