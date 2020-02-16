import axios from 'axios'
import { $ } from './bling'

const mapOptions =  {
	center:{
		lat:43.2,
		lng:-79.8
	},
	zoom:2
};

function loadPlaces(map,lat = 43.2,lng=-79.8){
	axios.get(`/api/stores/near?lat=${lat}&lng=${lng}`)
		.then(res => {
			const places = res.data;
			if(!places){
				alert('no found places');
				return;
			}

			//create boouds
			const bounds = new google.maps.LatLngBounds(); 
			const infoWindow = new google.maps.InfoWindow();
			const marker = places.map(place => {
				const [placeLng,placesLat] = places.location.coordinates;
				const position = { lat:placesLat,lng:placeLng };
				const marker  = new google.maps.Marker({map,position});
				marker.place = place;
				return marker;
			});

			markers.forEach(marker => marker.addListener('click',function(){
				infoWindow.setContent(this.place.name);
				infoWindow.open(map,this);
			}))

			map.setCenter(bounds.getCenter());
			map.fitBounds(bounds);
		})
}

function makeMap(mapDiv){
	if(!mapDiv) return;

	const map = new google.maps.Map(mapDiv,mapOptions);
 	loadPlaces(map);
	const input = $('[name="geolocate"]');
	const autocomplete = new google.maps.places.Autocomplete(input);
 
}

export default makeMap;