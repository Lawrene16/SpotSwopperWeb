import { Component, OnInit, ViewChild } from '@angular/core';
import * as firebase from 'firebase';
import { Storage } from '@ionic/storage';
import { Router } from '@angular/router';


@Component({
  selector: 'app-myaccount',
  templateUrl: './myaccount.page.html',
  styleUrls: ['./myaccount.page.scss'],
})

export class MyaccountPage implements OnInit {

  firedata = firebase.database();
  @ViewChild('nameinput', {static:false}) namebox;
  // @ViewChild('emailinput') emailbox;
  isPasswordReadOnly = true;
  isPersonalReadonly = true;
  nottrue = true;
  fullname;
  email;
  balance;
  password = "dkjgkdflgjdlf";
  confirmpassword = "dfkgjdfkgjhfj";
  testint = 0;
  myrefid;


  constructor(public storage: Storage,
    public router: Router
    ) { }

  ngOnInit() {
  }

  ngAfterViewInit(){

  }
  

  ionViewWillEnter() {
    this.firedata.ref('/users').child(firebase.auth().currentUser.uid).once('value', snapshot => {
      var res = snapshot.val();
      this.fullname = res.name;
        this.balance = res.balance.toFixed(2);
        this.email = res.email;
        this.myrefid = "SpotSwopper Refferal Code: " + res.refnumber
    }).then(() =>{
      console.log("Account details fetched")
    }).catch((err) =>{
      console.log(err)
    })
    // console.log('Ion view hs entered again');
    // if (this.testint == 0) {

      // console.log("dfdfdfdf")
    //   this.storage.get('userdetails').then((res) => {
    //     console.log(res);
    //     this.fullname = res.name;
    //     this.balance = res.balance.toFixed(2);
    //     this.email = res.email;
    //     this.myrefid = "SpotSwopper Refferal Code: " + res.refnumber
    //   }).catch((err) => {
    //     alert(err);
    //   })
    // } else {
    //   this.storage.get('afterfundbalance').then((res) => {
    //     if (res != null) {
    //       this.balance = res.toFixed(2)
    //     }
    //   });
    // }

    console.log(this.testint);
  }


   withdrawfunds(){
     this.router.navigateByUrl('/withdrawal')
   }

  // makeEditable(index) {
  //   switch (index) {
  //     case 1:
  //       this.isPersonalReadonly = false;
  //       this.isPasswordReadOnly = true;
  //       this.namebox.setFocus();
  //       // this.emailbox.removeFocus();
  //       break;
  //   }
  // }

  // stopEdit() {
  //   this.isPersonalReadonly = true;
  //   this.isPasswordReadOnly = true;
  // }


}
