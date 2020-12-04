html_to_insert = ""

for (l = 2; l <= 6; l++) {
  html_to_insert += `<div class="w3-row">`
  html_to_insert += `<div class="w3-twothird w3-container">`
  html_to_insert += `<h3 class="w3-text-teal" id="L${l}">L = ${l}</h3>`
  for (k = 2; k <= 6; k++) {
    let bestPoints = JSON.parse(localStorage.getItem("l"+l+"k"+k));
    let bestScore = "Unknown";
    if (bestPoints != null) {
      bestScore = bestPoints.length;
    }
    html_to_insert += `<h4>K = ${k}</h4><p>Current best score is : ${bestScore}</p>`
    if (bestScore != "Unknown") {
      html_to_insert += '<p href="game.html"> Coordinates of the points are : <br>';
      for (i=0; i < bestScore; i++) {
        html_to_insert += "(" + bestPoints[i].x + ", " + bestPoints[i].y + ") "
      }
      html_to_insert += '</p><p><a href="game.html?l='+l+'&k='+k+'">Click here to load the best score</a></p>';
    }
  }
  html_to_insert += `</div></div>`
}

document.getElementById("main").insertAdjacentHTML('beforeend', html_to_insert);