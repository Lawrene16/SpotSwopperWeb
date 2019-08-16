InfoPopup.prototype = new google.maps.OverlayView();
function InfoPopup(marker, map, options) {
  var bounds = new google.maps.LatLngBounds(
        new google.maps.LatLng(marker.position.lat(), marker.position.lng()),
        new google.maps.LatLng(marker.position.lat(), marker.position.lng())
      );
  this.options_ = options;
  this.bounds_ = bounds;
  this.map_ = map;
  this.div_ = null;
  this.setMap(map);
}
InfoPopup.prototype.onAdd = function() {
  var div = document.createElement('div');
  div.style.border = this.options_.border || 'none';
  div.style.position = 'absolute';
  div.className =  this.options_.className || 'info-pop-up-content';
  div.style.background = this.options_.background || '#FFFFFF';
  div.style.zIndex = 106;
  div.innerHTML = this.options_.content || '<a href="http://sarthakdabhi.me/" target="_blank">By Sarthak Dabhi</a>';
  div.style.boxShadow = '0 -1px 0 #e5e5e5,0 0 2px rgba(0,0,0,.12),0 2px 4px rgba(0,0,0,.24)';
  this.div_ = div;
  var panes = this.getPanes();
  panes.overlayLayer.appendChild(div);
};
InfoPopup.prototype.draw = function() {
  var overlayProjection = this.getProjection();
  var sw = overlayProjection.fromLatLngToDivPixel(this.bounds_.getSouthWest());
  var ne = overlayProjection.fromLatLngToDivPixel(this.bounds_.getNorthEast());
  var div = this.div_;
  div.parentNode.style.zIndex = 106;
  div.parentNode.parentNode.style.zIndex = 4;
  div.style.padding = this.options_.padding || '10px 20px';
  var width = this.options_.minWidth || div.offsetWidth;
  div.style.left = sw.x - (width/2) + 'px';
  div.style.bottom = -sw.y + 45 + 'px';
  div.style.width = this.options_.minWidth + 'px' || 'auto';
  div.style.height = 'auto';
};
InfoPopup.prototype.onRemove = function() {
  this.div_.parentNode.removeChild(this.div_);
  this.div_ = null;
};