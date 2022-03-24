// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.9/firebase-app.js";
import {
  getFirestore,
  collection,
  doc,
  addDoc,
  getDocs,
  Timestamp,
  query,
  orderBy,
  limit,
} from "https://www.gstatic.com/firebasejs/9.6.9/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB3yFu9PeviYCZLey3y6jG-tuPkDk_ZCzc",
  authDomain: "danjoemybro-portfolio.firebaseapp.com",
  projectId: "danjoemybro-portfolio",
  storageBucket: "danjoemybro-portfolio.appspot.com",
  messagingSenderId: "549728945168",
  appId: "1:549728945168:web:974f6876ec9d3f50cc3695",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);

// get docs

function wc_hex_is_light(color) {
  const hex = color.replace("#", "");
  const c_r = parseInt(hex.substr(0, 2), 16);
  const c_g = parseInt(hex.substr(2, 2), 16);
  const c_b = parseInt(hex.substr(4, 2), 16);
  const brightness = (c_r * 299 + c_g * 587 + c_b * 114) / 1000;
  return brightness > 155;
}

function getRandomColor() {
  return "#" + Math.floor(Math.random() * 16777215).toString(16);
}

const getColors = async () => {
  const q = query(collection(db, "colors"), orderBy("color"), limit(25));
  const querySnapshot = await getDocs(q);
  $(() => {
    $(".cards").empty();

    let cardsHTML = "";

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const textColor = wc_hex_is_light(data.color) ? "#000" : "#fff";

      cardsHTML += `<div 
      class="color-card" 
      style="background-color:${data.color}; color:${textColor};">
        <p style="font-weight: 300">${data.colorName}</p>
        <p>${data.color}</p>
      </div>`;
    });

    $(".cards").html(cardsHTML);
  });
};

getColors();

// add docs

$(() => {
  $("form").on("submit", () => {
    const colorName = $("#color-name").val();

    if (colorName.length <= 40) {
      const docToAdd = {
        colorName: colorName,
        color: $("#chosen-color").val(),
        created: Timestamp.now(),
        likes: [],
        dislikes: [],
      };

      console.log(docToAdd);

      try {
        addDoc(collection(db, "colors"), docToAdd);
        console.log("Document written with ID: " + docToAdd.color);
        $("#chosen-color").val(getRandomColor());
        $("#color-name").val("");
        getColors();
      } catch (e) {
        console.error("Error adding document: ", e);
      }
    } else {
      alert("Hello Sneaky!");
      $("#color-name").val("");
    }
  });

  // Set random color on the button
  $("#chosen-color").val(getRandomColor());
});

// get from firebase only on first launch, then add new docs to table.
