class OVC {
	ovcs;
	controller;
	constructor(){
		this.loadOVCs();
	}
	loadOVCs(){
		this.ovcs = document.getElementsByClassName('ovc'); //get ovcs
		let ovcts = document.getElementsByClassName('ovct'); //get targeted ovcs
		this.ovcts = new Map();
		for(let e of ovcts){
			this.ovcts.set(e, this.getTarget(e));
		}
		this.controller?.abort();
		this.controller = new AbortController();
		window.addEventListener('resize', ()=>this.update());
		window.addEventListener('DOMContentLoaded', ()=>this.update());
	}
	getTarget(e){
		for(; e.classList.contains('ovct'); e = e.parentElement);
		return e;
	}
	update(){
		for(let e of this.ovcs){
			if (e.scrollHeight > e.clientHeight) {
				e.classList.add('ovc_y');
			} else {
				e.classList.remove('ovc_y');
			}
			if (e.scrollWidth > e.clientWidth) {
				e.classList.add('ovc_x');
			} else {
				e.classList.remove('ovc_x');
			}
		};
		for(let e of this.ovcts){
			if (e[0].scrollHeight > e[0].clientHeight) {
				e[1].classList.add('ovc_y');
			} else {
				e[1].classList.remove('ovc_y');
			}
			if (e[0].scrollWidth > e[0].clientWidth) {
				e[1].classList.add('ovc_x');
			} else {
				e[1].classList.remove('ovc_x');
			}
		};

	}
}

ovc = new OVC();
