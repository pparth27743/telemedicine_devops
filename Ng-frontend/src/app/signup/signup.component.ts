import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthServiceService } from '../services/auth-service.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {

  signUpForm: FormGroup;
  
  constructor(private authService:AuthServiceService) { }

  ngOnInit(): void {
    this.initForm();
  }

  initForm (){
    this.signUpForm = new FormGroup({
      first_name: new FormControl("Alay", Validators.required),
      last_name: new FormControl("Dhagiya", Validators.required),
      email: new FormControl("alay@gmail.com", Validators.required),
      password: new FormControl("alay@123")
    });
  }

  signupProcess(){
    if(this.signUpForm.valid){
      this.authService.signup(this.signUpForm.value).subscribe(result => {
        if(result.success){
          console.log(result);
          alert(result.message);
        }else{
          alert(result.message);
        }
      })
    }
  }

}

