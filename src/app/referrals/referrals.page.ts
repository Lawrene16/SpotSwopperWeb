import { Component, OnInit } from '@angular/core';
import { Storage } from '@ionic/storage';
import * as firebase from 'firebase';


@Component({
  selector: 'app-referrals',
  templateUrl: './referrals.page.html',
  styleUrls: ['./referrals.page.scss'],
})
export class ReferralsPage implements OnInit {

  firedata = firebase.database();
  refereeslist = [];
  isempty:any;
  refcode;

  constructor(public storage: Storage) { }

  ngOnInit() {
  }

  ngAfterViewInit(){
    this.loadMyReferees();
  }

  loadMyReferees(){
    this.refereeslist = [];

    this.firedata.ref('/users').child(firebase.auth().currentUser.uid).
      child('referrals').orderByChild('mm').once('value', snapshot => {
        let result = snapshot.val();
        let temparr = [];
        for (var key in result) {
          temparr.push(result[key]);
        }
        temparr.forEach(refr => {
          this.refereeslist.push(refr)
        });

        if(this.refereeslist.length == 0){
          this.isempty = true;
        }else{
          this.isempty = false;
        }

      })
  }

  doRefresh(refresher) {

    setTimeout(() => {
      console.log('Async operation has ended');
      refresher.target.complete();
      this.loadMyReferees();
    }, 2500);
  }

}
