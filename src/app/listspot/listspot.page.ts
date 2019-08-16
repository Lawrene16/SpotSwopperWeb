import { Component, OnInit } from "@angular/core";
import { Storage } from "@ionic/storage";
import * as firebase from "firebase";
import { ToastController, LoadingController, NavController } from "@ionic/angular";

@Component({
  selector: "app-listspot",
  templateUrl: "./listspot.page.html",
  styleUrls: ["./listspot.page.scss"]
})
export class ListspotPage implements OnInit {
  spottype;
  price;
  description;
  maxbuyers;
  spotlocation;
  spotdist;
  pinuid;
  boxischecked = false;
  firedata = firebase.database();

  constructor(private storage: Storage,
    private loadingCtrl: LoadingController,
    private navCtrl: NavController,
     private toastCtrl: ToastController) {}

  ngOnInit() {
    this.storage.get("listspotdetais").then(res => {
      this.spotdist = res.spotdist;
      this.spotlocation = res.spotlocation;
    });
  }

  listSpot() {
    if (this.price == undefined) {
      this.presentToast("Invalid price");
    } else if (this.description == undefined) {
      this.presentToast("Description has to be more than 10 letters");
    } else if (this.spottype == undefined) {
      this.presentToast("Invalid Spot Type");
    } else if (this.boxischecked != true){
      this.presentToast("Please check the box to verify that you have read the Terms and Conditions");      
    }
    else{
      this.loadingCtrl.create({
        message: 'Listing your spot'
      }).then((res) =>{
        res.present()
        this.pinuid = this.firedata.ref('/allpins').push().key;
        this.firedata.ref('/allpins').child(this.pinuid).set({
          pinowner: firebase.auth().currentUser.uid,
                      price: this.price,
                      pinuid: this.pinuid,
                      dist: this.spotdist,
                      buyers: 'a',
                      purchased: false,
                      maxbuyers: this.maxbuyers,
                      description: this.description,
                      lat: this.spotlocation.lat,
                      lng: this.spotlocation.lat,
                      pintype: this.spottype
        }).then(() =>{                    
          this.firedata.ref('/users').child(firebase.auth().currentUser.uid).child('listed').child(this.pinuid).set({          
            pinuid: this.pinuid
          }).then(() =>{
            res.dismiss();
            this.presentToast('Spot listed');
            this.navCtrl.navigateBack('/home')
          }).catch((err) =>{
            alert(err)
          })
        }).catch((err) =>{
          console.log(err);
        });
      })
    }
  }

  async presentToast(message) {
    const toast = await this.toastCtrl.create({
      message: message,
      duration: 3000,
      color: 'dark'
    });
    toast.present();
  }

  chee(event){
    this.boxischecked = event.detail.checked;
    console.log(this.boxischecked)
  }
}
