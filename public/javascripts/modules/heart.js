import { $ } from './bling';
import axios from 'axios';

function heart(e){
	e.preventDefault();
	axios
		.post(this.action)
		.then(res => {
			const hearted = this.heart.classList.toggle('heart__button--hearted');
			$('.heart-count').textContent = res.data.hearts.length;
			if(hearted){
				this.heart.classList.toggle('heart__button--float');
				setTimeout(() => { this.heart.classList.toggle('heart__button--float'); },2500);
			}
		})
}


export default heart;