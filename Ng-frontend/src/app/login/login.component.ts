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

    rolelist = [
        { value: 'Doctor', viewValue: 'Doctor' },
        { value: 'Patient', viewValue: 'Patient' },
      ];
    
    loginForm: FormGroup;

    constructor(private authService: AuthServiceService, private router: Router) {
    }

    ngOnInit(): void {
        this.initForm();
    }

    initForm() {
        this.loginForm = new FormGroup({
            email: new FormControl("", Validators.required),
            password: new FormControl("", Validators.required),
            role: new FormControl("", Validators.required)
    });
}

loginProcess() {
    if (this.loginForm.valid) {
        this.authService.login(this.loginForm.value).subscribe(result => {
            if (result.success) {
                alert(result.message);
                const currentUser = JSON.parse(localStorage.getItem('currentUser'));
                if(currentUser['role'] === 'Doctor'){
                    this.router.navigate(['dashboard/doctor/home']);  
                }else{
                    this.router.navigate(['dashboard/patient/home']);
                }
                
            } else {
                alert(result.message);
            }
        })
    }
}

}
