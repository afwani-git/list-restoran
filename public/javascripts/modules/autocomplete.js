function autocomplete(input,latInput,lngInput){
		
		if(!input) return;

		const dropdown = new google.maps.places.Autocomplete(input)
		dropdown.addListener("place_changed",() => {
			const places = dropdown.getPlace();
			latInput.value = places.geometry.location.lat();
			lngInput.value = places.geometry.location.lng();
		})

		input.on('keydown',(e) => {
			if(e.keyCode == 13) e.preventDefault();
		})
}

export default autocomplete;