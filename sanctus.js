const disciplines = [
  {
    title: "Nirvana&#39;s Mark",
    sp: 0,
    description: "Passive: +2 Maximum Health<br>Status: Heal 1",
  },
  {
    title: "Intervention",
    sp: 2,
    description: `Exhaust: An ally within SOI gains an
    Intervention token. {See the Intervention Token for more}<br>Reduce
    the SP cost of this Discipline by 1 if the target is an ally other
    than yourself.`,
  },
];

function getSP(count) {
  let out = "";
  for (let i = 0; i < count; i++) {
    out += "⬤<br>";
  }
  return out;
}

$(() => {
  let html = "";
  disciplines.map((discipline) => {
    html += `
    <div class="card">
      <h3>${discipline.title}</h3>
      <div class="card-content">
        <p>${getSP(discipline.sp)}</p>
        <p>${discipline.description}</p>
      </div> 
    </div>
    `;
  });

  $("section").html(html);
});
