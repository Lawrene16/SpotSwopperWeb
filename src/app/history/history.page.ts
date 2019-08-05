import { Component, OnInit } from '@angular/core';
import { Storage } from '@ionic/storage';
import * as firebase from 'firebase';

@Component({
  selector: 'app-history',
  templateUrl: './history.page.html',
  styleUrls: ['./history.page.scss'],
})
export class HistoryPage implements OnInit {

  firedata = firebase.database();
  transactionlist = [];
  isempty:any;


  constructor(public storage: Storage) { }

  ngOnInit() {
  }

  ngAfterViewInit(){
    this.loadMyTransactions();
  }

  loadMyTransactions(){
    this.transactionlist = [];
    this.firedata.ref('/users').child(firebase.auth().currentUser.uid).
    child('transactions').orderByChild('mm').once('value', snapshot => {
      let result = snapshot.val();
      let temparr = [];
      for (var key in result) {
        temparr.push(result[key]);
      }
      temparr.forEach(transaction => {
        if(temparr.length != 0){
         this.transactionlist.push(transaction);
        }
      });

      if(this.transactionlist.length == 0){
        this.isempty = true;
      }else{
        this.isempty = false;
      }
    });
  }

  doRefresh(refresher) {

    

    setTimeout(() => {
      console.log('Async operation has ended');
      refresher.target.complete();
      this.loadMyTransactions();
    }, 2500);
  }



}
