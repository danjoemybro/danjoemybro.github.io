let random = Math.random();

for (let i = 0; i < 1000; i++) {
  const child = document.createElement("p");
  let number = `${Math.floor(Math.random() * 999)}`;
  while (number.length < 3) number = "0" + number;

  var text = document.createTextNode(number + ", ");
  child.appendChild(text);

  // tag.style['color'] = "#" + Math.floor(Math.random()*16777215).toString(16);
  child.style["opacity"] = `${Math.random() * 0.8 + 0.2}`;
  child.style["transform"] = `
  rotate(${Math.random() * 360}deg)
  scaleY(${Math.random() * 3 + 0.2})
  scaleX(${Math.random() * 3 + 0.2})
  `;

  const element = document.getElementById("new");
  element.appendChild(child);

  // element.style['clip-path'] = 'circle(5em at center)';
  // element.style["width"] = "10em";
}
