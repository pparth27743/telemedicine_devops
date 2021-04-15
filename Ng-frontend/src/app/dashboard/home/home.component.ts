import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthServiceService } from 'src/app/services/auth-service.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  constructor(private authService:AuthServiceService, private router: Router) { 
    
    const user = localStorage.getItem('currentUser');
    this.authService.validate().subscribe(result => {
      // console.log(result.success);
      if(result.validtoken === 0) {
        localStorage.removeItem('currentUser');
        this.router.navigate(['/login']);
      }
    });

    if (user) {
    
    }
  }

  ngOnInit(): void {
  }

}
