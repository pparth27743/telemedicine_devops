import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthServiceService } from '../services/auth-service.service';
import { listOfSpecialization } from '../shared/variables';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {

  rolelist = [
    { value: 'Doctor', viewValue: 'Doctor' },
    { value: 'Patient', viewValue: 'Patient' },
  ];

  
  specializations = listOfSpecialization;
  signUpForm: FormGroup;

  constructor(private authService: AuthServiceService, private router: Router) { }

  ngOnInit(): void {
    this.initForm();
  }

  onChangeRole(role) {
    if (role === 'Doctor') {
      this.signUpForm.addControl("specialization", new FormControl("", Validators.required));
    } else {
      this.signUpForm.removeControl("specialization");
    }
  }

  initForm() {
    this.signUpForm = new FormGroup({
      firstname: new FormControl("", Validators.required),
      lastname: new FormControl(""),
      email: new FormControl("", Validators.required),
      password: new FormControl("", Validators.required),
      role: new FormControl("", Validators.required)
    });
  }

  signupProcess() {
    if (this.signUpForm.valid) {
      this.authService.signup(this.signUpForm.value).subscribe(result => {
        if (result.success === 1) {
          console.log(result);
          alert(result.message);
          this.router.navigate(['login']);
        } else {
          alert(result.message);
        }
      })
    }
  }

}

