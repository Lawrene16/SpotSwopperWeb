import { Injectable } from '@angular/core';
import * as firebase from 'firebase';
import { Facebook } from '@ionic-native/facebook/ngx';
import { GooglePlus } from '@ionic-native/google-plus/ngx';


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private fb: Facebook,
    private googleplus: GooglePlus) { }

  facebookNativeLogin() {
    return new Promise((resolve, reject) => {
      this.fb.login(['email', 'public_profile']).then((response) =>{
        const facebookCredential = firebase.auth.FacebookAuthProvider.credential(response.authResponse.accessToken);
  
        
        firebase.auth().signInWithCredential(facebookCredential).then((result) =>{
          var user = result.user;
          resolve(user)
        }).catch((err) =>{
          reject(err);
        })
      })
      })
  }


  
  
  googleNativeLogin() {
    return new Promise((resolve, reject) => {
        this.googleplus.login({
          'webClientId': '72131126436-cn1e98df7gpmc6u6m0r1p0id67q1mi8d.apps.googleusercontent.com',
          'scopes': '',
          'offline': true
        }).then((response) => {
          const googleCredential = firebase.auth.GoogleAuthProvider.credential(response.idToken);
          firebase.auth().signInWithCredential(googleCredential)
            .then((result) => {
              var user = result.user;
              resolve(user);
            });
        }, (err) => {
          reject(err);
        });
    })
  }

}
