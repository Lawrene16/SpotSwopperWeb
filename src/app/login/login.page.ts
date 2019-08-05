import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import * as firebase from 'firebase';



@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  email = "a@gmail.com";
  password = "aaaaaaaa";
  firedata = firebase.database();

  constructor(private router: Router,
    private storage: Storage,
    private loadingCtrl: LoadingController) { }

  ngOnInit() {
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
    this.firedata.ref('/users').child(firebase.auth().currentUser.uid).once('value', snapshot => {
      this.storage.set('userdetails', snapshot.val()).then(() => {
        res.dismiss();
        this.router.navigateByUrl('/home');
      });
    });
  }


}
