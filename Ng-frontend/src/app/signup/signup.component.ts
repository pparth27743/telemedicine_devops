import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthServiceService } from '../services/auth-service.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {

  signUpForm: FormGroup;
  
  constructor(private authService:AuthServiceService, private router: Router) { }

  ngOnInit(): void {
    this.initForm();
  }

  initForm (){
    this.signUpForm = new FormGroup({
      firstname: new FormControl("", Validators.required),
      lastname: new FormControl("", Validators.required),
      email: new FormControl("", Validators.required),
      password: new FormControl("")
    });
  }

  signupProcess(){
    if(this.signUpForm.valid){
      this.authService.signup(this.signUpForm.value).subscribe(result => {
        if(result.success === 1){
          console.log(result);
          alert(result.message);
          this.router.navigate(['login']);
        }else{
          alert(result.message);
        }
      })
    }
  }

}

