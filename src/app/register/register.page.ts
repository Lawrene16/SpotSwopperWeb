import { Component, OnInit } from '@angular/core';
import { LoadingController, ToastController, MenuController } from '@ionic/angular';
import { AuthService } from '../auth.service';
import * as firebase from 'firebase';
import { Storage } from '@ionic/storage';
import { Router } from '@angular/router';


@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {

  email = "";
  password = "";
  confirmpassword = "";
  firedata = firebase.database();
  myreflink = "";
  myrefnumber;
  registerrefnumber = "";
  allusersarray = [];
  transactionslist = [];
  referallslist = [];

  constructor(private toastController: ToastController,
    private auth: AuthService,
    private storage: Storage,
    private router: Router,
    private loadingCtrl: LoadingController) { }

  ngOnInit() {
  }

  ngAfterViewInit(){
    this.myrefnumber = this.getRandomInt(19283, 30000);
    this.myreflink = "SPOT" + this.myrefnumber + "SWOPPER";
  }

  registerNewUser() {

    if (this.email == "" || !this.email.includes("@") || !this.email.includes(".")) {
      this.presentToast("Email format is invalid")
    } else if (this.password == "" || this.password.length < 6) {
      this.presentToast("Invalid password length. Please use 6 characters or more");
    } else if (this.confirmpassword != this.password) {
      this.presentToast("Password confirmation doesnt match with password please check and try again");
    } else {

      var reeeee = this.firedata.ref('/users').push().key;
      this.loadingCtrl.create({
        message: 'Creating your account',
      }).then((load) =>{
      load.present();

      firebase.auth().createUserWithEmailAndPassword(this.email, this.password).then(() => {

        if (this.registerrefnumber == "") {
          this.storeUserStuff("No Name", this.email, "", load)
        }

        else if (this.registerrefnumber != "") {
          this.firedata.ref('/users').orderByChild('mmm').once('value', (snapshot) => {
            let result = snapshot.val();
            let temparr = [];
            for (var key in result) {
              temparr.push(result[key]);
            }
            temparr.forEach(user => {
              if (this.registerrefnumber == user.refnumber) {
                console.log(user);

                this.firedata.ref('/users').child(firebase.auth().currentUser.uid).set({
                  name: '',
                  balance: 15,
                  email: this.email,
                  refnumber: this.myrefnumber,
                  referallink: this.myreflink,
                  referee: user.uid,
                  referrals: "",
                  uid: firebase.auth().currentUser.uid,
                  photoURL: firebase.auth().currentUser.photoURL,
                  purchased: "",
                  sold: "",
                  listed: ""

                }).then(() => {
                  this.firedata.ref('/users').child(firebase.auth().currentUser.uid).once('value', snapshot => {
                    this.storage.set('userdetails', snapshot.val()).then(() => {
                      // this.navCtrl.setRoot(HomePage);
                      this.router.navigateByUrl('/home')
                      load.dismiss();
                    });
                  });
                });
              }
            })
          });

        }
      }).catch((err) => {
        load.dismiss();
        this.presentToast(err)
      });

      });


    }

  }

  getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  storeUserStuff(name, email, photo, load) {

    console.log(firebase.auth().currentUser.uid)
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

  googleLogin(){
    this.auth.popupGoogleLogin().then((res:any) =>{

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

  fblogin() {
    this.auth.popupFacebookLogin().then((res:any) => {
      this.loadingCtrl.create({
        message: 'Logging you in',
      }).then((load) =>{
          load.present();
          this.checkIfUserExits(res.uid).then((isthereuser) => {
            this.presentToast(isthereuser)
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

  loadUserDetails(res:any) {
    this.firedata.ref('/users').child(firebase.auth().currentUser.uid).once('value', snapshot => {
      this.storage.set('userdetails', snapshot.val()).then(() => {
        res.dismiss();
        this.router.navigateByUrl('/home');
      });
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
