import { Injectable } from '@angular/core';
import * as firebase from 'firebase';
import { Facebook, FacebookLoginResponse } from "@ionic-native/facebook/ngx";
import { GooglePlus } from '@ionic-native/google-plus/ngx';


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(
    private fb: Facebook,
    private googleplus: GooglePlus
  ) { }

  // facebookNativeLogin() {
  //   return new Promise((resolve, reject) => {

  //     var perms = new Array("email", "public_profile");

  //     this.fb.getLoginStatus().then((res) => {
  //       if (res.status === "connected") {
  //         // Already logged in to FB so pass credentials to provider (in my case firebase)
  //         let credentials2 = firebase.auth.FacebookAuthProvider.credential(
  //           res.authResponse.accessToken
  //         );
  //         firebase
  //           .auth()
  //           .signInWithCredential(credentials2)
  //           .then((result2) => {
  //             var user2 = result2.user;
  //             resolve(user2);
  //           })
  //           .catch((err) => {
  //             reject(err);
  //           });
  //       } else {
  //         // Not already logged in to FB so sign in
  //         this.fb
  //           .login(perms)
  //           .then((response: FacebookLoginResponse) => {
  //             const facebookCredential = firebase.auth.FacebookAuthProvider.credential(
  //               response.authResponse.accessToken
  //             );
  //             firebase
  //               .auth()
  //               .signInWithCredential(facebookCredential)
  //               .then((result) => {
  //                 var user = result.user;
  //                 resolve(user);
  //               })
  //               .catch((err) => {
  //                 reject(err);
  //               });
  //           })
  //           .catch((err) => {
  //             reject(err);
  //           });
  //       }
  //     });
  //     })
  // }


  
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

  popupGoogleLogin() {
    return new Promise((resolve, reject) => {
      var provider = new firebase.auth.GoogleAuthProvider();

      firebase
        .auth()
        .signInWithPopup(provider)
        .then(function (result) {
          // This gives you a Google Access Token. You can use it to access the Google API.
          // var token = result.credential.accessToken;
          // The signed-in user info.
          var user = result.user;
          resolve(user);
          // ...
        })
        .catch(function (error) {
          // Handle Errors here.
          var errorCode = error.code;
          var errorMessage = error.message;
          // The email of the user's account used.
          var email = error.email;
          // The firebase.auth.AuthCredential type that was used.
          var credential = error.credential;
          // ...

          reject(error)
        });
    })
  }

  popupFacebookLogin() {
    return new Promise((resolve, reject) => {
      var provider = new firebase.auth.FacebookAuthProvider();

      firebase
        .auth()
        .signInWithPopup(provider)
        .then(function (result) {
          // This gives you a Facebook Access Token. You can use it to access the Facebook API.
          // var token = result.credential.accessToken;
          // The signed-in user info.
          var user = result.user;

          resolve(user);

          // ...
        })
        .catch(function (error) {
          // Handle Errors here.
          var errorCode = error.code;
          var errorMessage = error.message;
          // The email of the user's account used.
          var email = error.email;
          // The firebase.auth.AuthCredential type that was used.
          var credential = error.credential;
          // ...
        });
      
    })
  }

}
