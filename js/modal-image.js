// image ids to open
const imageIds = [
  "c-01",
  "c-02",
  "c-03",
  "c-04",
  "c-05",
  "c-06",
  "c-07",
  "c-08",
];

// Get the modal
var modal = document.getElementById("myModal");

// Get the image and insert it inside the modal - use its "alt" text as a caption

var modalImg = document.getElementById("img01");
var captionText = document.getElementById("caption");

imageIds.map((s, i) => {
  var img = document.getElementById(s);

  img.onclick = function () {
    modal.style.display = "block";
    modalImg.src = this.src;
    captionText.innerHTML = this.alt;
  };
});

const closeModal = () => {
  modal.style.display = "none";
};

// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];

// When the user clicks on <span> (x), close the modal
span.onclick = closeModal;

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeModal();
  }
});
