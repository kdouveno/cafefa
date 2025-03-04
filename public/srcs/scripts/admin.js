
class admin {
	constructor(){
		document.getElementById('admin').addEventListener('submit', (e)=>ajax(e, this.uploadimg));
	}
	uploadimg(res){
		
		document.getElementById('imguploadres').innerText = res.message;
	}
}
document.addEventListener('DOMContentLoaded', () => {
	admin = new admin();
});