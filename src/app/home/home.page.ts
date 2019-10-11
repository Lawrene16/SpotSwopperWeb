import { Component, ViewChild, ElementRef, NgZone } from "@angular/core";
import { Storage } from "@ionic/storage";
import { Geolocation } from "@ionic-native/geolocation/ngx";
import { LoadingController, ToastController } from "@ionic/angular";
import * as firebase from "firebase";
import { Router } from "@angular/router";

declare var require: any;

declare var google: any;

@Component({
  selector: "app-home",
  templateUrl: "home.page.html",
  styleUrls: ["home.page.scss"]
})
export class HomePage {
  // Viewchildren
  @ViewChild("mymap", { static: false }) mapElement: ElementRef;

  // Boolean variables
  private isInASearchedLocation: boolean = false;
  private isOn: boolean = false;
  private isFilterSelected: boolean = false;
  private isListedSelected: boolean = false;
  private isSoldSelected: boolean = false;
  private isPurchasedSelected: boolean = false;




  // Anonymous variables
  spotclickedicon = {
    url: "../../assets/icon/red.png", // url
    scaledSize: new google.maps.Size(20, 20), // scaled size
    origin: new google.maps.Point(0, 0), // origin
    anchor: new google.maps.Point(0, 0) // anchor
  };
  map: any;
  globalmarker;
  defaultposmarker;
  truelocationmarker;
  searchpinmarker;
  markerposbeforetrueclick;
  removedmarkers = [];

  globaldetailsinfowindow;
  globalpriceinfowindow;
  firebaseArray: any = [];
  autocomplete: any;
  GoogleAutocomplete;
  geocoder;
  autocompleteItems = [];
  searchedplaces = [];
  mylocation;
  newmarkerlocation;
  markerslist: any = [];
  filteredspottype = "";

  // Other Variables
  defaultzoomevel = 18;
  defaultloadradius = 3;
  mindefmarkerrandomgap = 7;
  firedata = firebase.database();
  unselected = "light";
  selected = "primary";

  constructor(
    private storage: Storage,
    private ngZone: NgZone,
    private router: Router,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    private geolocation: Geolocation
  ) {
    Window["myComponent"] = this;
    (<any>window).ionicPageRef = { zone: this.ngZone, component: this };
    this.GoogleAutocomplete = new google.maps.places.AutocompleteService();
    this.autocomplete = { input: "" };
    this.autocompleteItems = [];
    this.geocoder = new google.maps.Geocoder();
  }

  toggleSearchbar() {
    this.ngZone.run(() => {
      this.isOn = !this.isOn;
      this.autocompleteItems = [];
      this.autocomplete.input = "";
    });
  }

  ionViewWillEnter() {
    this.ngZone.run(() => {
      this.geolocation
        .getCurrentPosition()
        .then(resp => {
          this.mylocation = {
            lat: resp.coords.latitude,
            lng: resp.coords.longitude
          };
          this.loadMap();
        })
        .catch(err => {
          console.log(err);
        });
    });
  }

  // Creates random center points for our markers when they load
  createRandomPointInCircle(centerPoint, radius) {
    var angle = Math.random() * Math.PI * 2;
    var x =
      Math.cos(angle) *
        this.getRandomArbitrary(this.mindefmarkerrandomgap / 10000, radius) +
      centerPoint.x;
    var y =
      Math.sin(angle) *
        this.getRandomArbitrary(this.mindefmarkerrandomgap / 10000, radius) +
      centerPoint.y;
    return new google.maps.Point(x, y);
  }

  // Generate random numbers around the value of the radius
  getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
  }

  // Map init happens here
  loadMap() {
    // The map is initialized here
    this.markerslist = [];
    let latLng = new google.maps.LatLng(
      this.mylocation.lat,
      this.mylocation.lng
    );
    let mapOptions = {
      disableDefaultUI: true,
      // center: latLng,
      zoom: this.defaultzoomevel,
      mapTypeId: google.maps.MapTypeId.HYBRID
    };
    this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);

    var originalMarker = new google.maps.Marker({
      position: latLng,
      map: this.map,
      animation: google.maps.Animation.BOUNCE
    });
    var searchedMarker = new google.maps.Marker({
      map: this.map,
      animation: google.maps.Animation.BOUNCE
    });
    // originalMarker.setMap(null)
    // Storing the marker in a global variable
    this.defaultposmarker = originalMarker;

    google.maps.event.addListenerOnce(this.map, "idle", () => {
      this.storage.get('appjustlaunching').then(appjustlaunching =>{
        if(appjustlaunching == "true"){
          this.map.setCenter(latLng);
          // console.log(appjustlaunching)
          this.drawMarkersInCircle(originalMarker);
        }else{
          this.storage.get('markertodrawcirclesaround').then(markertodrawcirclesaround =>{
            searchedMarker.setPosition(
              new google.maps.LatLng(
                markertodrawcirclesaround.lat,
                markertodrawcirclesaround.lng
            ));
            this.map.setCenter(
              new google.maps.LatLng(
                markertodrawcirclesaround.lat,
                markertodrawcirclesaround.lng
            ));
            this.drawMarkersInCircle(searchedMarker)
          })
        }
      });
    });

    // This listens for when there is a click event on the map
    this.map.addListener("click", e => {
      this.addMarker(this.map, e.latLng);
      this.newmarkerlocation = {
        lat: e.latLng.lat(),
        lng: e.latLng.lng()
      };
    });
  }

  // Random markers are drawn around default marker here
  drawMarkersInCircle(defmarker) {
    // Important!!! when a spot is being pinned it should send the src nd size to firebase so we dont have long crap everywhere
    this.loadingCtrl
      .create({
        message: "Fetching spots less than 20 miles away"
      })
      .then(res => {
        res.present();
        this.getdist();
        var proj = this.map.getProjection();
        var centerPoint = proj.fromLatLngToPoint(defmarker.getPosition());
        var radius = this.defaultloadradius / 10000;
        var loc1 = defmarker.getPosition();

        // this.storage.set('appjustlaunching', 'false');
        // console.log(loc1 )
        this.firedata
          .ref("/allpins")
          .orderByChild("mjbmmn")
          .once("value", snapshot => {
            this.firebaseArray = [];
            let result = snapshot.val();
            for (var key in result) {
              this.firebaseArray.push(result[key]);
            }
            res.dismiss();
            this.firebaseArray.forEach(firebaseSpot => {
              var loc2 = new google.maps.LatLng(
                firebaseSpot.lat,
                firebaseSpot.lng
              );

              var dist = loc2.distanceFrom(loc1);
              dist = dist / 1000;

              // distance check condition, if spot is 20miles from you
              if (dist < 0.2) {
                // this.switchSpotIcons(firebaseSpot);
                var point = this.createRandomPointInCircle(centerPoint, radius);
                var pos = proj.fromPointToLatLng(point);
                this.initPriceInfowindow(pos, firebaseSpot);

                // this.loadSpotsForBottom();
                var uniquemarkerslist = this.markerslist.filter((item, pos) => {
                  return this.markerslist.indexOf(item) == pos;
                });
                this.markerslist = uniquemarkerslist;
              }
            });
          })
          .catch(err => {
            res.dismiss();
            console.log(err);
          });
      });
  }

  // price Infowindow is init here
  initPriceInfowindow(position, firebaseSpot: any) {
    const SnazzyInfoWindow = require("snazzy-info-window");
    var marker = new google.maps.Marker({
      position: position,
      map: this.map,
      icon: this.switchSpotIcons(firebaseSpot),
      title: ""
    });

    var priceinfoWindow = new SnazzyInfoWindow({
      marker: marker,
      borderRadius: "5px",
      panOnOpen: false,
      placement: "bottom",
      showCloseButton: false,
      closeOnMapClick: false,
      offset: {
        top: "25px",
        left: "14px"
      },
      pointer: "3px",
      padding: "1px",
      fontSize: "12px",
      content:
        '<div style="padding-left: 8px; padding-right: 8px">' +
        "$" +
        firebaseSpot.price +
        "</div>"
    });

    var detailsinfoWindow = new SnazzyInfoWindow({
      marker: marker,
      borderRadius: "8px",
      maxWidth: 200,
      maxheight: 300,
      placement: "top",
      closeOnMapClick: true,
      showCloseButton: false,
      panOnOpen: false,
      offset: {
        top: "2px",
        left: "12px"
      },
      pointer: "5px",
      padding: "0px",
      fontSize: "12px",
      content: this.initDetailsInfoWindow(firebaseSpot, 0)
    });
    // this.markerslist.push(marker);
    priceinfoWindow.open();

    // Infowindow to show as the owner
    if (firebaseSpot.pinowner == firebase.auth().currentUser.uid) {
      detailsinfoWindow.setContent(this.initDetailsInfoWindow(firebaseSpot, 1));
    }

    // If the user has bought the spot
    else if (
      JSON.stringify(firebaseSpot.buyers).includes(
        firebase.auth().currentUser.uid
      )
    ) {
      detailsinfoWindow.setContent(this.initDetailsInfoWindow(firebaseSpot, 2));
    }

    // Pinuid is for the fetched pins when clicked
    marker.addListener("click", () => {
      this.storage.set("spotdetails", firebaseSpot).then(() => {
        this.map.setZoom(this.defaultzoomevel);
        this.map.panTo(marker.getPosition());

        if (this.globaldetailsinfowindow != undefined) {
          this.globaldetailsinfowindow.close();
          this.globalpriceinfowindow.open();
        }
        priceinfoWindow.close();
        detailsinfoWindow.open();

        this.globaldetailsinfowindow = detailsinfoWindow;
        this.globalpriceinfowindow = priceinfoWindow;
        this.truelocationmarker = {
          initialmarkerpos: marker.getPosition(),
          spot: firebaseSpot,
          marker: marker
        };

      });
    });

    this.map.addListener("click", () => {
      priceinfoWindow.open();
    });

    this.markerslist.push({
      spot: firebaseSpot,
      markertouse: marker,
      pricewindow: priceinfoWindow,
      detailswindow: detailsinfoWindow
    });
  }

  // Init details infowindow
  initDetailsInfoWindow(firebaseSpot, index) {
    var spotdetailsstring;
    switch (index) {
      // Others
      case 0:
        spotdetailsstring =
          "<div>" +
          '<div style="background-color: #ebebeb; padding: 6px; width: 100%; text-align: center">' +
          '<b style="font-size: 13px">' +
          firebaseSpot.pintype +
          "</b>" +
          "</div>" +
          '<div style="font-size: 12px; padding-left: 8px; padding-right: 8px; padding-top: 8px; padding-bottom: 2px">Price: $' +
          firebaseSpot.price +
          '<b style="color: #fe3300; margin-left: 1px; font-size: 11px"> + Exclusive 10% service fee</b></div>' +
          '<div style="font-size: 12px; padding-left: 8px; padding-right: 8px; padding-top: 8px; padding-bottom: 6px">Details: ' +
          firebaseSpot.description +
          "<br></div>" +
          // Empty div
          '<div style="font-size: 12px; padding-left: 8px;padding-right: 8px;><br></div>' +
          '<div style="font-size: 12px; padding-left: 8px;padding-right: 8px;>Location: <b>' +
          firebaseSpot.dist +
          "miles away</b><br>The current location of this marker is not the true location of this spot, Purchase it to unlock its true location</div>" +
          "</div>" +
          '<div onClick="window.ionicPageRef.zone.run(function () { window.ionicPageRef.component.purchaseSpot() })" style="margin-top: 10px; background-color: #ebebeb; padding: 6px; width: 100%; text-align: center">' +
          '<b style="font-size: 12px; color: #fe3300">Purchase to unlock true location</b>' +
          "</div>" +
          "</div>";

        break;

      // Owner
      case 1:
        spotdetailsstring =
          "<div>" +
          '<div style="background-color: #ebebeb; padding: 6px; width: 100%; text-align: center">' +
          '<b style="font-size: 13px">' +
          firebaseSpot.pintype +
          "</b>" +
          "</div>" +
          '<div style="font-size: 12px; padding-left: 8px; padding-right: 8px; padding-top: 8px; padding-bottom: 2px">Price: $' +
          firebaseSpot.price +
          '<b style="color: #fe3300; margin-left: 1px; font-size: 11px"> + Exclusive 10% service fee</b></div>' +
          '<div style="font-size: 12px; padding-left: 8px; padding-right: 8px; padding-top: 8px; padding-bottom: 6px">Details: ' +
          firebaseSpot.description +
          "<br></div>" +
          '<div style="font-size: 12px; padding-left: 8px;padding-right: 8px;><br></div>' +
          '<div style="font-size: 12px; padding-left: 8px;padding-right: 8px;>Location: <b>' +
          firebaseSpot.dist +
          "miles away(" +
          firebaseSpot.lat.toFixed(4) +
          "," +
          firebaseSpot.lng.toFixed(4) +
          ")</b><br></div>" +
          "</div>" +
          '<div onClick="window.ionicPageRef.zone.run(function () { window.ionicPageRef.component.removeSpot() })" style="margin-top: 10px; background-color: #ebebeb; padding: 6px; width: 100%; text-align: center">' +
          '<b style="font-size: 12px; color: #fe3300">Remove Spot</b>' +
          "</div>" +
          "</div>";
        break;

      // Has bought it
      case 2:
        spotdetailsstring =
          "<div>" +
          '<div style="background-color: #ebebeb; padding: 6px; width: 100%; text-align: center">' +
          '<b style="font-size: 13px">' +
          firebaseSpot.pintype +
          "</b>" +
          "</div>" +
          '<div style="font-size: 12px; padding-left: 8px; padding-right: 8px; padding-top: 8px; padding-bottom: 2px">Price: $' +
          firebaseSpot.price +
          '<b style="color: #fe3300; margin-left: 1px; font-size: 11px"> + Exclusive 10% service fee</b></div>' +
          '<div style="font-size: 12px; padding-left: 8px; padding-right: 8px; padding-top: 8px; padding-bottom: 6px">Details: ' +
          firebaseSpot.description +
          "<br></div>" +
          '<div style="font-size: 12px; padding-left: 8px;padding-right: 8px;><br></div>' +
          '<div style="font-size: 12px; padding-left: 8px;padding-right: 8px;>Location: <b>' +
          firebaseSpot.dist +
          "miles away(" +
          firebaseSpot.lat.toFixed(4) +
          "," +
          firebaseSpot.lng.toFixed(4) +
          ")</b><br></div>" +
          "</div>" +
          '<div onClick="window.ionicPageRef.zone.run(function () { window.ionicPageRef.component.viewTrueLocation() })" style="margin-top: 10px; background-color: #ebebeb; padding: 6px; width: 100%; text-align: center">' +
          '<b style="font-size: 12px; color: #fe3300">Go to true location</b>' +
          "</div>" +
          "</div>";

        break;
    }

    return spotdetailsstring;
  }

  // Here the owner of a spot can remove it
  removeSpot() {
    this.ngZone.run(() => {
      this.storage.get("spotdetails").then(res => {
        this.loadingCtrl
          .create({
            message: "Please wait"
          })
          .then(load => {
            load.present();
            this.firedata
              .ref("/allpins")
              .child(res.pinuid)
              .remove(() => {
                this.presentToast("Spot Removed Successfully");
                load.dismiss();
                this.ionViewWillEnter();
              })
              .catch(err => {
                load.dismiss();
                console.log(err);
              });
          });
      });
    });
  }

  // Presents a toast to the user
  async presentToast(message) {
    const toast = await this.toastCtrl.create({
      message: message,
      duration: 2000,
      position: "top",
      color: "dark"
    });
    toast.present();
  }

  // Apply filters for filterspots
  applyFilters() {
    this.isFilterSelected = false;
    this.ngZone.run(() =>{
      this.removedmarkers.forEach(removedmarker => {
        removedmarker.markertouse.setMap(this.map);
        removedmarker.pricewindow.open();
      });
      this.removedmarkers = [];

      switch (this.filteredspottype) {
        case "Hunting Spot":
          this.markerslist.forEach(markerandspot => {
            if (markerandspot.spot.pintype != "Hunting Spot") {
              markerandspot.markertouse.setMap(null);
              markerandspot.pricewindow.close();
              markerandspot.detailswindow.close();
              this.removedmarkers.push(markerandspot);
            }
          });
          break;

        
        case "Private Spot":
            this.markerslist.forEach(markerandspot => {
              if (markerandspot.spot.pintype != "Private Spot") {
                markerandspot.markertouse.setMap(null);
                markerandspot.pricewindow.close();
                markerandspot.detailswindow.close();
                this.removedmarkers.push(markerandspot);
              }
            });
            break;
      
        case "Fishing Spot":
            this.markerslist.forEach(markerandspot => {
              if (markerandspot.spot.pintype != "Fishing Spot") {
                markerandspot.markertouse.setMap(null);
                markerandspot.pricewindow.close();
                markerandspot.detailswindow.close();
                this.removedmarkers.push(markerandspot);
              }
            });
          break;

        case "Lease Spot":
            this.markerslist.forEach(markerandspot => {
              if (markerandspot.spot.pintype != "Lease Spot") {
                markerandspot.markertouse.setMap(null);
                markerandspot.pricewindow.close();
                markerandspot.detailswindow.close();
                this.removedmarkers.push(markerandspot);
              }
            });
          break;

        case "Spot for Sale":
            this.markerslist.forEach(markerandspot => {
              if (markerandspot.spot.pintype != "Spot for Sale") {
                markerandspot.markertouse.setMap(null);
                markerandspot.pricewindow.close();
                markerandspot.detailswindow.close();
                this.removedmarkers.push(markerandspot);
              }
            });
          break;

        case "Camping Spot":
            this.markerslist.forEach(markerandspot => {
              if (markerandspot.spot.pintype != "Camping Spot") {
                markerandspot.markertouse.setMap(null);
                markerandspot.pricewindow.close();
                markerandspot.detailswindow.close();
                this.removedmarkers.push(markerandspot);
              }
            });
          break;

        case "Lodge Spot":
            this.markerslist.forEach(markerandspot => {
              if (markerandspot.spot.pintype != "Lodge Spot") {
                markerandspot.markertouse.setMap(null);
                markerandspot.pricewindow.close();
                markerandspot.detailswindow.close();
                this.removedmarkers.push(markerandspot);
              }
            });
          break;

        case "MISC categories":
            this.markerslist.forEach(markerandspot => {
              if (markerandspot.spot.pintype != "MISC categories") {
                markerandspot.markertouse.setMap(null);
                markerandspot.pricewindow.close();
                markerandspot.detailswindow.close();
                this.removedmarkers.push(markerandspot);
              }
            });
          break;
      }

    })
  }

  // Take user to purchase spot page
  purchaseSpot() {
    this.ngZone.run(() => {
      if (firebase.auth().currentUser == null) {
        this.router.navigateByUrl("/login");
      } else {
        this.router.navigateByUrl("purchasespot");
      }
    });
  }

  // View the true location of the spot
  viewTrueLocation() {
    let latLng = new google.maps.LatLng(
      this.truelocationmarker.spot.lat,
      this.truelocationmarker.spot.lng
    );

    this.truelocationmarker.marker.setPosition(latLng);

    
    this.map.panTo(latLng);
    this.map.setZoom(this.defaultzoomevel);
  }

  // Update search results
  updateSearchResults() {
    if (this.autocomplete.input == "") {
      this.autocompleteItems = [];
      return;
    }
    // console.log("predictions");

    this.GoogleAutocomplete.getPlacePredictions(
      { input: this.autocomplete.input },
      (predictions, status) => {
        this.autocompleteItems = [];
        this.ngZone.run(() => {
          predictions.forEach(prediction => {
            this.autocompleteItems.push(prediction);
          });
        });
      }
    );
  }

  // On search result selected
  selectSearchResult(item) {
    this.autocompleteItems = [];
    this.isInASearchedLocation = true;

    if (this.searchpinmarker != undefined) {
      this.searchpinmarker.setMap(null);
    }
    this.searchpinmarker;
    this.geocoder.geocode({ placeId: item.place_id }, (results, status) => {
      if (status === "OK" && results[0]) {
        this.searchpinmarker = new google.maps.Marker({
          position: results[0].geometry.location,
          map: this.map,
          animation: google.maps.Animation.BOUNCE
        });
        this.map.setCenter(results[0].geometry.location);

        if (!this.searchedplaces.includes(item.place_id)) {
          this.drawMarkersInCircle(this.searchpinmarker);
          this.storage.set('appjustlaunching', 'false');
          this.searchedplaces.push(item.place_id);
        }
      }
    });
  }

  // Take user to list spot page
  listSpot() {
    this.ngZone.run(() => {
      this.getdist();
      var loc1 = new google.maps.LatLng(
        this.mylocation.lat,
        this.mylocation.lng
      );
      var loc2 = new google.maps.LatLng(
        this.newmarkerlocation.lat,
        this.newmarkerlocation.lng
      );

      // Store searched marker and original marker in variable to be used later

      var originalmarkervar = {
        lat: this.defaultposmarker.getPosition().lat(),
        lng: this.defaultposmarker.getPosition().lng()
      }
      

      if (this.isInASearchedLocation == true) {
        if(this.searchpinmarker != undefined){
          var searchpinmarkervar = {
            lat: this.searchpinmarker.getPosition().lat(),
            lng: this.searchpinmarker.getPosition().lng()
          }
          this.storage.set('markertodrawcirclesaround', searchpinmarkervar);
          this.storage.set('appjustlaunching', "false");
  
        }
      }else{
        this.storage.set('markertodrawcirclesaround', originalmarkervar);
        this.storage.set('appjustlaunching', "true");
      }
      

      var dist = loc2.distanceFrom(loc1) / 1000;

      if (firebase.auth().currentUser == null) {
        this.router.navigateByUrl("/login");
      } else {
        this.storage
          .set("listspotdetais", {
            spotdist: dist,
            spotlocation: this.newmarkerlocation
          })
          .then(() => {
            this.router.navigateByUrl("listspot");
          });
      }
    });
  }

  // Marker is added when a spot is clicked
  addMarker(map, position) {
    if (this.globalmarker != undefined) {
      this.globalmarker.setMap(null);
    }

    if (this.globaldetailsinfowindow == undefined) {
      var marker = new google.maps.Marker({
        position: position,
        map: map,
        icon: this.spotclickedicon,
        draggable: true,
        animation: google.maps.Animation.BOUNCE
      });
      this.globalmarker = marker;
      // if (map.getZoom() <= this.defaultzoomevel) {
      //   map.setZoom(this.defaultzoomevel);
      // }
      map.panTo(marker.getPosition());
    } else if (!this.globaldetailsinfowindow.isOpen()) {
      var marker = new google.maps.Marker({
        position: position,
        map: map,
        icon: this.spotclickedicon,
        draggable: true,
        animation: google.maps.Animation.BOUNCE
      });
      this.globalmarker = marker;
      if (map.getZoom() <= this.defaultzoomevel) {
        map.setZoom(this.defaultzoomevel);
      }
      map.panTo(marker.getPosition());
    }

    var contentstring =
      '<div style="margin-right: 10px"">' +
      '<div onClick="window.ionicPageRef.zone.run(function () { window.ionicPageRef.component.listSpot() })" style="width: 100%; text-align: center">' +
      "<div>List Spot</div>" +
      "</div>" +
      "</div>";

    const SnazzyInfoWindow = require("snazzy-info-window");
    var listspotinfoWindow = new SnazzyInfoWindow({
      marker: marker,
      borderRadius: "6px",
      maxWidth: 200,
      fontSize: "12px",
      fontColor: "#ffffff",
      maxheight: 150,
      backgroundColor: "#fe3300",
      placement: "top",
      closeOnMapClick: true,
      showCloseButton: false,

      panOnOpen: true,
      offset: {
        top: "-8px",
        left: "11px"
      },
      pointer: "3px",
      padding: "6px",
      content: contentstring
    });
    listspotinfoWindow.open();
  }

  // Goes to your current position when fab is clicked
  gotomypos() {
    this.isOn = false;
    this.isInASearchedLocation = false;
    this.autocompleteItems = [];
    this.autocomplete.input = "";
    this.searchpinmarker = undefined;
    // Store searched marker in variable to be used later
    if(this.searchpinmarker != undefined){
      var searchpinmarkervar = {
        lat: this.searchpinmarker.getPosition().lat(),
        lng: this.searchpinmarker.getPosition().lng()
        }
        this.storage.set('markertodrawcirclesaround', searchpinmarkervar);
    }
    this.storage.set('appjustlaunching', "true");


    let latLng = new google.maps.LatLng(
      this.mylocation.lat,
      this.mylocation.lng
    );
    this.map.setZoom(this.defaultzoomevel);
    this.map.panTo(latLng);
    if (this.truelocationmarker != undefined) {
      this.truelocationmarker.marker.setPosition(
        this.truelocationmarker.initialmarkerpos
      );
    }
    if (this.globaldetailsinfowindow != undefined) {
      this.globaldetailsinfowindow.close();
      this.globalpriceinfowindow.open();
    }
    console.log(this.searchedplaces);
  }

  // Change icon colors on tab click
  changecolorandsize(index) {
    this.ngZone.run(() => {
      this.reset(index);
      switch (index) {
        case 1:
          this.isFilterSelected = !this.isFilterSelected;
          break;

        case 2:
          this.isListedSelected = !this.isListedSelected;
          break;

        case 3:
          this.isSoldSelected = !this.isSoldSelected;
          break;

        case 4:
          this.isPurchasedSelected = !this.isPurchasedSelected;
          break;
      }
      this.removeAllMarkersExcept(index);
    });
  }

  // Remove all the other spots apart from the one that was highlighted
  removeAllMarkersExcept(index) {
    this.ngZone.run(() => {
      this.removedmarkers.forEach(removedmarker => {
        removedmarker.markertouse.setMap(this.map);
        removedmarker.pricewindow.open();
      });
      this.removedmarkers = [];

      switch (index) {
        case 2:
          if (this.isListedSelected) {
            this.markerslist.forEach(markerandspot => {
              if (
                markerandspot.spot.pinowner != firebase.auth().currentUser.uid
              ) {
                markerandspot.markertouse.setMap(null);
                markerandspot.pricewindow.close();
                markerandspot.detailswindow.close();
                this.removedmarkers.push(markerandspot);
              }
            });
          } else {
            this.removedmarkers.forEach(removedmarker => {
              // removedmarker.pricewindow.open();
              removedmarker.markertouse.setMap(this.map);
            });
          }
          break;

        case 3:
          if (this.isSoldSelected) {
            this.markerslist.forEach(markerandspot => {
              if (
                markerandspot.spot.pinowner ==
                  firebase.auth().currentUser.uid &&
                markerandspot.spot.buyers != "a"
              ) {
              } else {
                markerandspot.markertouse.setMap(null);
                markerandspot.pricewindow.close();
                markerandspot.detailswindow.close();
                this.removedmarkers.push(markerandspot);
              }
            });
          } else {
            this.removedmarkers.forEach(removedmarker => {
              removedmarker.markertouse.setMap(this.map);
            });
          }
          break;

        case 4:
          if (this.isPurchasedSelected) {
            this.markerslist.forEach(markerandspot => {
              if (
                !JSON.stringify(markerandspot.spot.buyers).includes(
                  firebase.auth().currentUser.uid
                )
              ) {
                markerandspot.markertouse.setMap(null);
                markerandspot.pricewindow.close();
                markerandspot.detailswindow.close();
                this.removedmarkers.push(markerandspot);
              }
            });
          } else {
            this.removedmarkers.forEach(removedmarker => {
              removedmarker.markertouse.setMap(this.map);
            });
          }
          break;

        case 2:
          break;

        case 2:
          break;

        case 2:
          break;
      }
    });
  }

  // Spot icons are switched here depending on their type
  switchSpotIcons(firebaseSpot) {
    var customicon;
    var size = new google.maps.Size(25, 25);
    customicon = "../../assets/icon/black.png";

    // switch (firebaseSpot.pintype) {
    //   case "Private Spot":
    //     customicon = '../../assets/icon/black.png';
    //     // anim = google.maps.Animation.DROP;
    //     break;
    //   case "Lease Spot":
    //     customicon = '../../assets/icon/yellow.png';
    //     // anim = google.maps.Animation.DROP;

    //     break;
    //   case "Spot for Sale":
    //     customicon = '../../assets/icon/green.png';
    //     size = new google.maps.Size(20, 20);
    //     // anim = google.maps.Animation.DROP;

    //     break;
    //   case "Spot Purchased":
    //     customicon = '../../assets/icon/blue.png';
    //     size = new google.maps.Size(40, 40);
    //     // anim = google.maps.Animation.DROP;
    //     break;

    //   case "Saved Spot":
    //     customicon = '../../assets/icon/red.png';
    //     // anim = google.maps.Animation.BOUNCE;

    //     break;

    //   case "Fishing Spot":
    //     customicon = '../../assets/icon/fish.png';
    //     size = new google.maps.Size(40, 40);
    //     // anim = google.maps.Animation.DROP;
    //     break;

    // }
    var icon = {
      url: customicon, // url
      scaledSize: size, // scaled size
      origin: new google.maps.Point(0, 0), // origin
      anchor: new google.maps.Point(0, 0) // anchor
    };

    return icon;
  }

  // Gets the distance between 2 markers
  getdist() {
    google.maps.LatLng.prototype.distanceFrom = function(latLng) {
      var lat = [this.lat(), latLng.lat()];
      var lng = [this.lng(), latLng.lng()];
      var R = 6378137;
      var dLat = ((lat[1] - lat[0]) * Math.PI) / 180;
      var dLng = ((lng[1] - lng[0]) * Math.PI) / 180;
      var a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat[0] * Math.PI) / 180) *
          Math.cos((lat[1] * Math.PI) / 180) *
          Math.sin(dLng / 2) *
          Math.sin(dLng / 2);
      var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      var d = R * c;
      return Math.round(d);
    };
  }

  // Reset all bottom tabs conditions to false
  reset(index) {
    if (index == 1) {
      this.isListedSelected = false;
      this.isSoldSelected = false;
      this.isPurchasedSelected = false;
    } else if (index == 2) {
      this.isFilterSelected = false;
      this.isSoldSelected = false;
      this.isPurchasedSelected = false;
    } else if (index == 3) {
      this.isFilterSelected = false;
      this.isListedSelected = false;
      this.isPurchasedSelected = false;
    } else if (index == 4) {
      this.isFilterSelected = false;
      this.isListedSelected = false;
      this.isSoldSelected = false;
    }
  }
}
