import { Component, OnInit } from "@angular/core";
import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Storage } from '@ionic/storage';
import { ToastController, LoadingController, Events, NavController } from '@ionic/angular';
// import undefined = require('firebase/empty-import');
// import { ThrowStmt } from '@angular/compiler';
// import { HttpClient, Headers, RequestOptions } from '@angular/http';
import * as firebase from 'firebase';
import { Router } from '@angular/router';


@Component({
  selector: "app-withdrawal",
  templateUrl: "./withdrawal.page.html",
  styleUrls: ["./withdrawal.page.scss"]
})


export class WithdrawalPage implements OnInit {
  constructor(public httpClient: HttpClient,
    public toastController: ToastController,
    public loadingCtrl: LoadingController,
    public navCtrl: NavController,
    public router: Router,
    public events: Events) {}

  firedata = firebase.database();

  basePostUrl = "https://api.sandbox.paypal.com/v1/payments/payouts";
  baseGetUrl = "https://api.sandbox.paypal.com/v1/payments/payouts/";
  accessToken = "A21AAFgUOqAhf39yi0Pl5LQoR2-zZBYcimNuDPK-Zvbv1GRqia9kC9EG-cgfTN5Z6CUQlY8hNk8TSuexI7NTe_EkhxK4-pzjA";
  paypalAuthUrl = "https://api.sandbox.paypal.com/v1/oauth2/token";
  amount;
  balance;
  email = "";
  boxischecked = false;


  ngOnInit() {
    // this.sendPostRequest();
    // this.sendGetRequest('ZPB69HHNL69X6');
    // this.getAccessToken()
  }

  ionViewWillEnter(){

    this.firedata.ref('/users').child(firebase.auth().currentUser.uid).once('value', snapshot => {
      this.balance = snapshot.val().balance.toFixed(2);
    });
  }

  getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  chee(event){
    this.boxischecked = event.detail.checked;
    // console.log(event.detail.checked)
  }

  withdrawFunds(){
    var remainingbalance = this.balance - 15;
    if(this.amount == undefined){
      this.presentToast("Withdrawal amount cannot be left blank")
    }
    else if(!(this.amount < (this.balance - 15))){
      this.presentToast("Withdrawal amount cannot be greater than your withdrawable spotswopper balance $" + remainingbalance)
    }else if(this.email == "" || this.email.length < 3 ||
    !this.email.includes('@') || !this.email.includes('.')){
      this.presentToast("Invalid email address")
    }else if(this.boxischecked == false){
      this.presentToast("You must check the box above to proceed with the withdrawal")
    }else{
      this.loadingCtrl.create({message: "Please wait..."}).then(res =>{
        this.debitUser(res);
      })
    }
  }

  sendPostRequest(res) {
    res.present();

    var headers = new HttpHeaders({
      "Content-Type": "application/json",
      Authorization:
        "Bearer " + this.accessToken
    });
    let postData = {
  "sender_batch_header": {
    "sender_batch_id": this.getRandomInt(2000000000, 9000000000),
    "email_subject": "SpotSwopper Notification",
    "email_message": "Your payment of " + this.amount + "USD has been processed you should receive it in your paypal balance before 24hours! Thanks for using our service!"
  },
  "items": [
    {
      "recipient_type": "EMAIL",
      "amount": {
        "value": this.amount,
        "currency": "USD"
      },
      "note": "Thanks for your patronage!",
      "sender_item_id": "201403140001",
      "receiver": this.email
    }
  ]
};

    this.httpClient
      .post(this.basePostUrl, postData, {
        headers: headers
      })
      .subscribe(
        data => {
          var returneddata:any = data
          console.log(data);
          console.log(returneddata.batch_header.payout_batch_id);
          // this.getRequestbatchID = returneddata.batch_header.payout_batch_id;
           setTimeout(() => {
            this.sendGetRequest(res, returneddata.batch_header.payout_batch_id)
          }, 5000);

        },
        error => {
          console.log(error);
        }
      );
  }

  sendGetRequest(res, batchID){
    var headers = new HttpHeaders({
      "Content-Type": "application/json",
      Authorization:
        "Bearer " + this.accessToken
    });

    this.httpClient.get(this.baseGetUrl + batchID + "?fields=batch_header", {
        headers: headers
      }).subscribe(
        data => {
          console.log(data);
          this.presentToast("Your withdrawal request has been submitted. Funds should appear in your paypal balance in less than 24 hours")
          res.dismiss()
        },
        error => {
          res.dismiss()
          this.presentToast("Unable to process your request" + error )
          this.navCtrl.navigateBack('/myaccount')

          console.log(error);
        }
      );
  }

  debitUser(res){
    this.firedata.ref('/users').child(firebase.auth().currentUser.uid).update({
      balance: this.balance - this.amount
    }).then(() =>{
      this.sendPostRequest(res);
    }).catch((err) =>{
      console.log(err)
    })
  }

  getAccessToken(){
    var details = {
      username: 'ATryMgkmh1DEhWQHLb2ZiRbKunD9Nvcb7BT6Qxij7r1y5pfHnywxv0Iu4_PLpRFQetHDmVO3zD1J8c4E',
      password: 'EI3zmLK3SPDJeqpMTWk5M4NMLPtNMiiBtpq_rXoBJgU07hsLw3xLA3B7OOp5ysiDHlz60KMvRedgXIcN'
    }

    var headers = new HttpHeaders({
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: "Basic Auth " + details
    });

    this.httpClient.post(
      this.paypalAuthUrl, {headers: headers}
    ).subscribe(
      data => {
        console.log(data);
      
      },
      error => {
        console.log(error);
      }
    );
  }

  async presentToast(message) {
    const toast = await this.toastController.create({
      message: message,
      duration: 4000,
      color: 'dark'
    });
    toast.present();
  }

}
