import { Component, OnInit } from '@angular/core';
import { Storage } from '@ionic/storage';
import * as firebase from "firebase";
import { HttpClient } from '@angular/common/http';
import { LoadingController, ToastController, NavController } from '@ionic/angular';

declare var Stripe;
declare var emailjs: any;

@Component({
  selector: 'app-purchasespot',
  templateUrl: './purchasespot.page.html',
  styleUrls: ['./purchasespot.page.scss'],
})
export class PurchasespotPage implements OnInit {
  price;
  transactionfee;
  totalamount;
  pinowner;
  userdetails;
  spotuid;
  myrefereebalance;
  myreferee;
  pinownerbalance;
  mybalance;
  selleremail;
  sellername;
  allaboutspot;
  firedata = firebase.database();


  stripe = Stripe('pk_test_FIrkWSsjvlx9TKX0hm3tAyiO');
  card: any;
  baseUrl = "http://caurix.net/stripeApi/stripe-php-6.30.4/spotgolbber.php";


  constructor(private storage: Storage,
    private http: HttpClient,
    private navCtrl: NavController,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController) { 
  }

  ngOnInit() {
    this.setupStripe();
    this.storage.get('spotdetails').then((spotdetails) =>{
      console.log(spotdetails)
      this.price = spotdetails.price * 100;
      this.transactionfee = spotdetails.price * 100 * 0.1;
      this.totalamount = this.price + this.transactionfee;
      this.pinowner = spotdetails.pinowner;
      this.spotuid = spotdetails.pinuid;

    // Pinowner details
      this.firedata.ref('/users').child(spotdetails.pinowner).once('value').then(snap => {
        this.pinownerbalance = snap.val().balance;
        this.selleremail = snap.val().email,
        this.sellername = snap.val().name
      });

    // My Details
    this.storage.get('userdetails').then((userdetails) => {
      this.userdetails = userdetails;
      this.firedata.ref('/users').child(userdetails.uid).once('value').then(snap => {
        this.mybalance = snap.val().balance;
      });
      // Referee balance
      console.log(userdetails)
      if (userdetails.referee != "") {
        this.myreferee = userdetails.referee;
        this.firedata.ref('/users').child(userdetails.referee).once('value').then(snap => {
          console.log(snap.val().balance)
          this.myrefereebalance = snap.val().balance;
        });
      }
      this.allaboutspot = spotdetails;

    });
    })
  }

  setupStripe() {

    let elements = this.stripe.elements();
    var style = {
      base: {
        color: '#32325d',
        lineHeight: '24px',
        fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
        fontSmoothing: 'antialiased',
        fontSize: '16px',
        '::placeholder': {
          color: '#aab7c4'
        }
      },
      invalid: {
        color: '#fa755a',
        iconColor: '#fa755a'
      }
    };
    this.card = elements.create('card', { style: style });
    this.card.mount('#card-element');
    this.card.addEventListener('change', event => {
      var displayError = document.getElementById('card-errors');
      if (event.error) {
        displayError.textContent = event.error.message;
      } else {
        displayError.textContent = '';
      }
    });
  }

  createtoken(){
    this.loadingCtrl.create({
      message: 'Processing your payment please wait...',}).then((load) =>{
      this.stripe.createSource(this.card).then(result => {
        if (result.error) {
          var errorElement = document.getElementById('card-errors');
          errorElement.textContent = result.error.message;
        } else {
          load.present();
          this.stripe.createToken(this.card).
            then((res) => {
              this.makePost(res.token.id, load);
            }).catch((err) => {
              console.log(err);
              load.dismiss()
            })
        }
      });
    });
  }

  makePost(cardtoken, load){
    var url = this.baseUrl;
    let postData = new FormData();
    postData.append('stripeToken', cardtoken);
    postData.append('spotUid', this.spotuid);
    postData.append('amount', this.totalamount);

    this.http.post(url, postData).subscribe((data) =>{
      var result:any = data;
      var buyersuid = this.firedata.ref('/allpins').child(this.spotuid).push().key;
      var transactionkey = this.firedata.ref('/users').child(firebase.auth().currentUser.uid).push().key;

      // Update the pin buyers with user'suid
      this.firedata.ref('/allpins').child(this.spotuid).
      child('buyers').child(buyersuid).set(firebase.auth().currentUser.uid).then(() => {

        // Add the payment to the universal payments array
        this.firedata.ref('/allpayments').child(result.id).set(data).then(() => {

          // Check if the user has a referee and has never made a purchase
              if (this.userdetails.referee != "" && this.userdetails.purchased == "") {

                // Update referees balance with 5% of the purchase value
                this.firedata.ref('/users').child(this.userdetails.referee).update({
                  balance: this.myrefereebalance + this.price / 2000
                }).then(() => {

                  // Update the user's transactions with the details of this transaction
                  this.firedata.ref('/users').child(this.userdetails.referee).child('transactions').child(transactionkey).set({
                    aboutspot: this.allaboutspot,
                    type: "in",
                    refcut: this.price / 2000,
                    pricetoshow: this.price / 2000,
                    desctoshow: "Earned from your referral's first purchase"
                  })
                });
              }

              // Update the pinowner's balance
              this.firedata.ref('/users').child(this.pinowner).update({
                balance: this.pinownerbalance + this.price / 100
              }).then(() => {

                // Update the pinowner's sold spots list
                this.firedata.ref('/users').child(this.pinowner).child('sold').child(this.spotuid).set({
                  pinuid: this.spotuid
                }).then(() => {

                  // Update my purchased spots list
                  this.firedata.ref('/users').child(this.userdetails.uid).child('purchased').child(this.spotuid).set({
                    pinuid: this.spotuid
                  });
                }).then(() => {

                  // Update my transactions with the details of this transaction
                    this.firedata.ref('/users').child(this.userdetails.uid).child('transactions').child(transactionkey).set({
                      aboutspot: this.allaboutspot,
                      type: "out",
                      pricetoshow: this.allaboutspot.price,
                      desctoshow: this.allaboutspot.description
                    }).then(() => {

                      // Send email to the buyer
                      this.sendEmailAfterPurchase(this.userdetails.email, this.allaboutspot.price, this.userdetails.name, this.allaboutspot.pintype, this.allaboutspot.description);

                      // Update the pinowner's transactions with the details of this transaction
                      this.firedata.ref('/users').child(this.pinowner).child('transactions').child(transactionkey).set({
                        aboutspot: this.allaboutspot,
                        type: "in",
                        pricetoshow: this.allaboutspot.price,
                        desctoshow: this.allaboutspot.description

                      }).then(() => {

                        // Send email to the seller
                        this.sendHasEarnedEmail(this.selleremail, this.allaboutspot.price, this.selleremail, this.allaboutspot.pintype, this.allaboutspot.description);
                        load.dismiss();
                        this.presentToast('Payment Succesful');
                        this.navCtrl.navigateBack('/home')
                      })
                    })
                  });
              });
        }).catch((err) => {
          console.log(err);
        });
      }).catch((err) => {
        console.log(err);
      });

    },(err) => {
      console.log(err);
      load.dismiss();
      this.presentToast('Couldnt process payment');
    });
  }

  async presentToast(message) {
    const toast = await this.toastCtrl.create({
      message: message,
      duration: 2000,
      position: 'top',
      color: 'dark'
    });
    toast.present();
  }

  sendEmailAfterPurchase(toEmail, spotPrice, toName, spotType, spotDesc) {
    emailjs.send("gmail", "template_fi0l0FGM",
      {
        "to_email": toEmail,
        "from_name": "SpotSwopper",
        "spot_price": spotPrice,
        "to_name": toName,
        "spot_type": spotType,
        "reply_to": "lawrenedickson49@gmail.com",
        "spot_desc": spotDesc
      }, "user_a5F4Y0bqr5CqaymXTcGdJ").then((response) => {
        console.log('SUCCESS!', response.status, response.text);
      }, (error) => {
        console.log('FAILED...', error);
      });
  }

  sendHasEarnedEmail(toEmail, spotPrice, toName, spotType, spotDesc) {
    emailjs.send("gmail", "earned_template",
      {
        "to_email": toEmail, "reply_to": "lawrenedickson49@gmail.com",
        "to_name": toName,
        "spot_price": spotPrice,
        "spot_type": spotType,
        "spot_desc": spotDesc
      }, "user_a5F4Y0bqr5CqaymXTcGdJ").then((response) => {
        console.log('SUCCESS!', response.status, response.text);
      }, (error) => {
        console.log('FAILED...', error);
      });
  }
}
