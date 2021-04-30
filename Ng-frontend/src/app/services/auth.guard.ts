import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthServiceService } from './auth-service.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private router: Router, private authService: AuthServiceService) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    const currentUser = this.authService.getcurrentUser;

    if(!currentUser){
      this.router.navigate(['']);
      return false;
    }
    
    this.authService.validate().subscribe(result => {
      if(result.validtoken === 0) {
        
        this.authService.logout();
        this.router.navigate(['login']);
        return false;
      }
    });

    return true;
  }

}
