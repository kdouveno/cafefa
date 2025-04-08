window.addEventListener("DOMContentLoaded", function () {
  var logo = document.querySelector(".logo");
  var navbar = document.querySelector(".navbar");
  if (logo) {
    window.addEventListener("scroll", function (e) {
      if (window.scrollY > logo.getBoundingClientRect().height)
        navbar.classList.add("seen");
      else
        navbar.classList.remove("seen");
    });
  } else {
    navbar.classList.add("seen");
  }
});
toggle_nav = function(e) {
  document.getElementById("menu_toggle").classList.toggle("active");
  document.getElementById("navbar").classList.toggle("active");
}