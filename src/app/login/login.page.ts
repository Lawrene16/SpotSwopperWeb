import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingController, ToastController, MenuController } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import * as firebase from 'firebase';

import { AuthService } from '../auth.service';


@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  email = "";
  password = "";
  firedata = firebase.database();
  myrefnumber;
  myreflink = "";

  constructor(private router: Router,
    private storage: Storage,
    private auth: AuthService,
    private menu: MenuController,
    private toastController: ToastController,
    private loadingCtrl: LoadingController) { 
      this.menu.enable(false, 'custom');

    }

  ngOnInit() {

  }

  ngAfterViewInit(){
    this.myrefnumber = this.getRandomInt(19283, 30000);
    this.myreflink = "SPOT" + this.myrefnumber + "SWOPPER";
  }

  getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  signin(){
    this.loadingCtrl.create({
      message: 'Logging you in',
    }).then((res) =>{
      res.present();

      firebase.auth().signInWithEmailAndPassword(this.email, this.password).then(() => {
        this.loadUserDetails(res)
      }).catch((err) => {
        res.dismiss()
        // this.presentToast(err)
      });;
    });
  }

  loadUserDetails(res:any) {
    this.storage.set('appjustlaunching', 'true');
    this.firedata.ref('/users').child(firebase.auth().currentUser.uid).once('value', snapshot => {
      this.storage.set('userdetails', snapshot.val()).then(() => {
        res.dismiss();
        this.router.navigateByUrl('/home');
      });
    });
  }

  fblogin() {
    this.auth.facebookNativeLogin().then((res:any) => {
      this.loadingCtrl.create({
        message: 'Logging you in',
      }).then((load) =>{
          load.present();
          this.checkIfUserExits(res.uid).then((isthereuser) => {
            // this.presentToast(isthereuser)
            switch (isthereuser) {
              case true:
                this.loadUserDetails(load);
                break;
              case false:
                this.storeUserStuff(res.displayName, res.email, res.photoURL, load);
                break;
            }
          }).catch((err) => {
            console.log(err)
            this.presentToast(err);
          });
      });
    }).catch((err) => {
      this.presentToast(err);
      console.log(err);
    });
  }


  googleLogin(){
    this.auth.googleNativeLogin().then((res:any) =>{

      console.log(res);
      this.loadingCtrl.create({
        message: 'Logging you in',
      }).then((load) =>{
        load.present();
        this.checkIfUserExits(res.uid).then((isthereuser) =>{
          // this.presentToast(isthereuser)
            switch (isthereuser) {
              case true:
                this.loadUserDetails(load);
                break;
              case false:
                this.storeUserStuff(res.displayName, res.email, res.photoURL, load);
                break;
            }
          }).catch((err) => {
            this.presentToast(err);
            console.log(err);
          });
      })
    }).catch((err) => {
      this.presentToast(err)
      console.log(err);
    });
  }


  storeUserStuff(name, email, photo, load) {
    this.storage.set('appjustlaunching', 'true');
    // console.log(firebase.auth().currentUser.uid)
    this.firedata.ref('/users').child(firebase.auth().currentUser.uid).set({
      name: name,
      balance: 15,
      email: email,
      refnumber: this.myrefnumber,
      referee: "",
      referallink: this.myreflink,
      referrals: "",
      uid: firebase.auth().currentUser.uid,
      photoURL: photo,
      purchased: "",
      sold: "",
      listed: ""
    }).then(() => {
      this.firedata.ref('/users').child(firebase.auth().currentUser.uid).once('value', snapshot => {
        // console.log(snapshot.val());
        this.storage.set('userdetails', snapshot.val()).then(() => {

          this.router.navigateByUrl('/home');
          if (load != null) {
            load.dismiss();
          }
        });
      });
    }).catch((err) =>{
      this.presentToast(err)
    });
  }

  checkIfUserExits(userId) {
    return new Promise((resolve, reject) => {
      firebase.database().ref('/users').child(userId).once('value', (snapshot) => {
        var exists = (snapshot.val() !== null);
        resolve(exists)
      }).catch((err) => {
        reject(err);
      });
    });
  }

  async presentToast(message) {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      color: 'dark'
    });
    toast.present();
  }
}
