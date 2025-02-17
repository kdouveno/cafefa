
function startAnim() {
    document.getElementById('main').classList.remove("first");
}

window.addEventListener('scroll', startAnim);
window.addEventListener('click', startAnim);