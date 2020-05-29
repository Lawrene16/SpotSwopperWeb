import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import * as firebase from 'firebase';

import { HttpClientModule } from '@angular/common/http';

import { AngularFireModule } from 'angularfire2';
import { AngularFireAuth } from 'angularfire2/auth';
// import { IonicRatingModule } from 'ionic-rating';

import { IonicRatingModule } from 'ionic4-rating';
import { StarRatingModule } from 'ionic4-star-rating';


import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { IonicStorageModule } from '@ionic/storage'
// import { SocialSharing } from '@ionic-native/status-bar/ngx';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import { AuthService } from './auth.service';
import { Facebook } from '@ionic-native/facebook/ngx';
import { GooglePlus } from '@ionic-native/google-plus/ngx';

import { Geolocation } from '@ionic-native/geolocation/ngx';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';



var firebaseconfig = {
  apiKey: "AIzaSyDxNm3T6n3CPB5u28aVRIIzggSV9HChpsw",
    authDomain: "spotgolbber.firebaseapp.com",
    databaseURL: "https://spotgolbber.firebaseio.com",
    projectId: "spotgolbber",
    storageBucket: "spotgolbber.appspot.com",
    messagingSenderId: "72131126436"
};


firebase.initializeApp(firebaseconfig);


@NgModule({
  declarations: [AppComponent],
  entryComponents: [],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    // IonicRa,
    StarRatingModule,
    HttpClientModule,    
    IonicStorageModule.forRoot(),
    AngularFireModule.initializeApp(firebaseconfig),
    AppRoutingModule,
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production })
  ],

  providers: [
    StatusBar,
    SplashScreen,
    Geolocation,
    Facebook,
    GooglePlus,
    AuthService,
    SocialSharing,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
