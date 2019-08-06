import { Component, ViewChild, ElementRef  } from '@angular/core';
import { Storage } from '@ionic/storage';
import { Geolocation } from '@ionic-native/geolocation/ngx';

declare var google: any;
@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  // Viewchildren
  @ViewChild('mymap', {static: false}) mapElement: ElementRef;

  // Boolean variables
  private isOn: boolean = false;

  // Anonymous variables
  spotclickedicon = {
    url: '../../assets/icon/red.png', // url
    scaledSize: new google.maps.Size(20, 20), // scaled size
    origin: new google.maps.Point(0, 0), // origin
    anchor: new google.maps.Point(0, 0) // anchor
  };
  map: any;
  addmarkerInfoWindow;
  globalmarker;
  newspotlat;
  newspotlng;
  mapclickinfowindow;

  // Other Variables
  defaultzoomevel = 18;



  constructor(private storage: Storage,
    private geolocation: Geolocation) {}

  toggleSearchbar(){
    this.isOn = !this.isOn;
  }


  ngAfterViewInit(){
    this.geolocation.getCurrentPosition().then((resp) =>{
      this.loadMap(resp.coords);
    }).catch((err) =>{
      console.log(err)
    })
  }

  // Map is loaded here
  loadMap(location){
    let latLng = new google.maps.LatLng(location.latitude, location.longitude);
    let mapOptions = {
      disableDefaultUI: true,
      center: latLng,
      zoom: this.defaultzoomevel,
      mapTypeId: google.maps.MapTypeId.HYBRID
    }
    this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);
    new google.maps.Marker({
      position: latLng,
      map: this.map,
    });
    google.maps.event.addListenerOnce(this.map, 'idle', () => {
      // this.drawMarkersInCircle(originalMarker);
    });

    this.map.addListener('click', (e) => {
      this.storage.set('position', e.latLng);
      // if (this.addmarkerInfoWindow == undefined) {
        // this.storage.get('position').then((res) => {
          this.addMarker(this.map, e.latLng);
      //   });
      // // } else {
      //   this.storage.get('position').then((res) => {
      //     this.addMarker(this.map, res);
      //   });
      // }
    });
  }

  addMarker(map, position) {
    if(this.globalmarker != undefined){this.globalmarker.setMap(null)}

    // var newpininfo = document.getElementById('newpininfo');
    // var savedpininfo = document.getElementById('savedpininfo');

    var marker = new google.maps.Marker({
      position: position,
      map: map,
      icon: this.spotclickedicon,
      draggable: true,
      animation: google.maps.Animation.BOUNCE,
    });
    this.globalmarker = marker;

    map.setZoom(this.defaultzoomevel);
    map.panTo(marker.getPosition());


    // this.mapclickinfowindow.open(map, marker);

// On infowindow close
    // google.maps.event.addListener(this.mapclickinfowindow, 'closeclick', function () {
    //   marker.setMap(null); //removes the marker
    // });

    this.newspotlat = position.lat;
    this.newspotlng = position.lng;
  }

}
