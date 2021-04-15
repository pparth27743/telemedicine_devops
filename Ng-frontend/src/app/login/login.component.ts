import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthServiceService } from '../services/auth-service.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  loginForm: FormGroup;
  
  constructor(private authService:AuthServiceService, private router: Router) { 
  }

  ngOnInit(): void {
    this.initForm();
  }

  initForm (){
    this.loginForm = new FormGroup({
      email: new FormControl("alay@gmail.com", Validators.required),
      password: new FormControl("alay@123")
    });
  }

  loginProcess(){
    if(this.loginForm.valid){
      this.authService.login(this.loginForm.value).subscribe(result => {
        if(result.success){
          alert(result.message);
          this.router.navigate(['/dashboard/home']);
        }else{
          alert(result.message);
        }
      })
    }
  }

}
