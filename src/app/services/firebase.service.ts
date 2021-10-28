import { Injectable, NgZone } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import {Router} from "@angular/router";
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {

  constructor(private ngZone: NgZone, private afAuth: AngularFireAuth, private firestore: AngularFirestore , private router: Router) { }

  public currentUser: any;
  public userStatus: string;
  public userStatusChanges: BehaviorSubject<string> = new BehaviorSubject<string>((this as this).userStatus);

  setUserStatus(userStatus: any): void {
    this.userStatus = userStatus;
    this.userStatusChanges.next(userStatus);
  }

  login(email: string, password: string) {
    this.afAuth.signInWithEmailAndPassword(email, password)
    .then((user)=>{
      this.firestore.collection("users").ref.where("username", "==", user.user.email).onSnapshot(snap =>{
        snap.forEach(userRef => {
          console.log("userRef", userRef.data());
          this.currentUser = userRef.data();
          //setUserStatus
          this.setUserStatus(this.currentUser)
          if(userRef.get('role') == "admin") {
            this.router.navigate(["/admin"]);
          }else if (userRef.get('role') == "tenant"){
            this.router.navigate(["/tenant"]);
          }else{
            this.router.navigate(["/home"]);
          }
        })
      })

    }).catch((err) => {
      console.log(err);
    })
}

logOut(){
  this.afAuth.signOut()
  .then(()=>{
    console.log("user signed Out successfully");
    //set current user to null to be logged out
    this.currentUser = null;
    //set the listenener to be null, for the UI to react
    this.setUserStatus(null);
    this.ngZone.run(() => this.router.navigate(["/home"]));

  }).catch((err) => {
    console.log(err);
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
