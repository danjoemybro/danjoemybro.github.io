const primaryNav = document.querySelector(".primary-navigation");
const navToggle = document.querySelector(".mobile-nav-toggle");
const icon = document.querySelector(".material-icons-round");

const toggleMenu = (e) => {
  let visibility = primaryNav.getAttribute("data-visible");
  visibility = JSON.parse(visibility);

  primaryNav.setAttribute("data-visible", !visibility);

  icon.innerHTML = visibility ? "menu" : "close";
};

navToggle.addEventListener("click", toggleMenu);

$(() => {
  $(".nav-link").on("click", toggleMenu);
});
