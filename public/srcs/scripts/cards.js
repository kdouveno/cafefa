class Cards{
	cards = new Map();
	cards_btns = [];
	current = 0;
	timer;
	zi = 0;
	constructor(){
		window.addEventListener('resize', ()=>this.update());
		window.addEventListener('DOMContentLoaded', ()=>{
			let cards = document.getElementsByClassName('card'); //get ovcs
			for(let e of cards){
				this.cards.set(e, e.querySelector("h3"));
			}
			this.setCardNav();
			this.update();
			this.timer = document.getElementById("timer_bar");
		});
	}
	update(){
		for(let e of this.cards){
			e[0].style.setProperty("--title-height", (e[1]?.getBoundingClientRect().height / e[0].getBoundingClientRect().height * 100) + "%");
		};
	}
	setCardNav(){
		let news_nav = document.getElementById('news_nav_btns');
		let nextBtn = document.createElement('div');
			nextBtn.setAttribute('onclick', "cards.scrollCard('next')");
		let previousBtn = document.createElement('div');
			previousBtn.setAttribute('onclick', "cards.scrollCard('previous')");
		let template = document.createElement('div');
			news_nav.appendChild(previousBtn);
		let i = 0;
		for(let e of this.cards){
			let clone = template.cloneNode(true);
			clone.setAttribute('onclick', "cards.scrollCard(" + i + ")");
			news_nav.appendChild(clone);
			this.cards_btns.push(clone);
			i++;
		}
		news_nav.appendChild(nextBtn);
	}
	scrollCard(i){
		let current = Array.from(this.cards.keys())[this.current];
		let index = i;
		if(i == "next"){
			index = this.current + 1;
			if (index >= this.cards.size) {
				index = 0;
			}
		} else if (i == "previous"){
			index = this.current - 1;
			if (index < 0) {
				index = this.cards.size - 1;
			}
		}
		if (index != current) {
			let target = Array.from(this.cards.keys())[index];
			let currentBtn = this.cards_btns[this.current];
			let targetBtn = this.cards_btns[index];
			this.current = index;
			target.classList.remove('active');
			target.offsetWidth;
			currentBtn.classList.remove('active');
			this.zi++;
			target.style.setProperty('z-index', this.zi);
			target.classList.add('active');
			targetBtn.classList.add('active');
			this.resetTimer();
		}
	}
	resetTimer(){
		this.timer.classList.remove('timeon');
		this.timer.offsetWidth;
		this.timer.classList.add('timeon');
	}
	timeout(){
		this.scrollCard('next');
	}
}

cards = new Cards();
