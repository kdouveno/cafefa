window.addEventListener("scroll", function (e) {
  var navbar = document.querySelector(".navbar");
  var logo = document.querySelector(".logo");
  if (window.scrollY > logo.getBoundingClientRect().height)
  	navbar.classList.add("seen");
  else
  	navbar.classList.remove("seen");
});
toggle_nav = function(e) {
  document.getElementById("menu_toggle").classList.toggle("active");
  document.getElementById("navbar").classList.toggle("active");
}