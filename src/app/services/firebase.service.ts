import { Injectable, NgZone } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import {Router} from "@angular/router";
import { AngularFirestore } from '@angular/fire/firestore';
import { BehaviorSubject } from 'rxjs';
import { AlertService } from './alert.service';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {

  constructor(private ngZone: NgZone,
              private afAuth: AngularFireAuth,
              private firestore: AngularFirestore ,
              private router: Router,
              protected alertService: AlertService) { }

  public currentUser: any;
  public userStatus: string;
  public userStatusChanges: BehaviorSubject<string> = new BehaviorSubject<string>((this as this).userStatus);

  options = {
    autoClose: true,
    keepAfterRouteChange: true
  };

  setUserStatus(userStatus: any): void {
    this.userStatus = userStatus;
    this.userStatusChanges.next(userStatus);
  }

  login(email: string, password: string) {
    this.afAuth.signInWithEmailAndPassword(email, password)
    .then((user)=>{
      this.firestore.collection("users").ref.where("username", "==", user.user.email).onSnapshot(snap =>{
        snap.forEach(userRef => {
          this.currentUser = userRef.data();
          //setUserStatus
          this.setUserStatus(this.currentUser)
          if(userRef.get('role') == "admin" && userRef.get('status') == true) {
            this.router.navigate(["/admin"]);
            this.alertService.success('Admin Logged In Successfully!!', this.options);
          }else if (userRef.get('role') == "tenant" && userRef.get('status') == true){
            this.router.navigate(["/tenant"]);
            this.alertService.success('User Logged In Successfully!!', this.options);
          }else{
            this.router.navigate(["/home"]);
            this.alertService.info('Your ID is disabled. Please contact the Admin!!', this.options);
          }
        })
      })
    }).catch((err) => {
      this.alertService.error(err.message, this.options);
    })
}

logOut(){
  this.afAuth.signOut()
  .then(()=>{
    //set current user to null to be logged out
    this.currentUser = null;
    //set the listenener to be null, for the UI to react
    this.setUserStatus(null);
    this.ngZone.run(() => this.router.navigate(["/home"]));
    this.alertService.success('User Logged Out!!', this.options);

  }).catch((err) => {
    this.alertService.error(err.message, this.options);
  })
}

userChanges(){
  this.afAuth.onAuthStateChanged(currentUser => {
    if(currentUser){
      this.firestore.collection("users").ref.where("username", "==", currentUser.email).onSnapshot(snap =>{
        snap.forEach(userRef => {
          this.currentUser = userRef.data();
          //setUserStatus
          this.setUserStatus(this.currentUser);
          console.log(this.userStatus)

          if(userRef.get('role')  == "admin") {
           this.ngZone.run(() => this.router.navigate(["/admin"]));
          }else if(userRef.get('role')  == "tenant"){
           this.ngZone.run(() => this.router.navigate(["/tenant"]));
          }else{
            this.ngZone.run(() => this.router.navigate(["/home"]));
          }
        })
      })
    }else{
      this.ngZone.run(() => this.router.navigate(["/home"]));
    }
  })
}

}
