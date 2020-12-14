let winWidth = 800;
let winHeight = 600;
let winDiff = 40;
let collinearLine;
let points;
let colors = ["blue", "red", "grey", "yellow", "green", "orange", "pink"];

class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.adjacent = [];
    this.colour = -1;
  }
  show() {
    if (this.colour >= 0 && this.colour < 7) {
      fill(colors[this.colour]);
    } else {
      fill("red");
    }
    ellipse(this.x*winDiff, this.y*winDiff, 6, 6);
    fill("black");
  }
  showLine() {
    for (item of this.adjacent) {
      line(this.x*winDiff, this.y*winDiff, item.x*winDiff, item.y*winDiff);
    }
  }
  toString() {
    return "Point at : " + this.x + ", " + this.y;
  }
}

class Line {
  constructor(point, m) {
    this.point = point;
    this.m = m;
  }
  show() {
    stroke("blue");
    if (this.m === Infinity) {
      line(this.point.x*winDiff, 0, this.point.x*winDiff, winHeight);
    } else {
      line(0,
        this.point.y*winDiff-this.point.x*winDiff*this.m,
        winWidth,
        this.point.y*winDiff+(winWidth-this.point.x*winDiff)*this.m
      );
    }
    stroke("black");
  }
}

function setup() {
  const myCanvas = createCanvas(winWidth, winHeight);
  myCanvas.parent('canvasDiv');

  fill("black");
  textSize(40);
  button0 = createButton("Compute");
  button0.parent('subCanvas');
  button0.mouseClicked(compute);

  button1 = createButton("-");
  button1.parent('subCanvas');
  button1.mouseClicked(zoomOut);

  button2 = createButton("+");
  button2.parent('subCanvas');
  button2.mouseClicked(zoomIn);

  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  let l = urlParams.get('l');
  let k = urlParams.get('k');

  if (localStorage.getItem("l"+l+"k"+k) != null) {
    points = JSON.parse(localStorage.getItem("l"+l+"k"+k));
      for (let i = 0; i < points.length; i++) {
      points [i] = new Point(points[i].x, points[i].y);
    }
  } else {
    points= []
  }
}

function draw() {
  background(250);

  // Draw squared board
  stroke("gray");
  for (let i = 0; i < winHeight; i += winDiff) {
    line(0, i, winWidth, i);
  }
  for (let i = 0; i < winWidth; i += winDiff) {
    line(i, 0, i, winHeight);
  }

  // Draw all lines of the visibility graph 
  for (let i=0; i<points.length; i++) {
    points[i].showLine();
  }

  // Draw the line with most collinear points
  if (collinearLine) {
    new Line(collinearLine[1], collinearLine[2]).show();
  }

  // Draw the maximum clique
  stroke('violet');
  strokeWeight(2);
  for (let i = 0; i < myClique.length; i++) {
    for (let j = i+1; j < myClique.length; j++) {

      line(myClique[i].x*winDiff, myClique[i].y*winDiff, myClique[j].x*winDiff, myClique[j].y*winDiff);
    }
  }
  stroke('black');
  strokeWeight(1);

  // Draw all points
  fill("red");
  for (let i=0; i<points.length; i++) {
    points[i].show();
  } fill("black");
}

function mousePressed() {
  // Add a point when mouse is pressed on the canvas
  // If condition because sometimes point is added when 
  // clicked outside of the canvas
  if (mouseY < winHeight && mouseX < winWidth) {
    let x = Math.round(mouseX/winDiff);
    let y = Math.round(mouseY/winDiff);
    let duplicate = false;
    let i = 0;
    while (i < points.length && !duplicate) {
      if (points[i].x === x && points[i].y === y) {
        duplicate = true;
      }
      i++;
    }
    if (!duplicate) {
      points.push(new Point(Math.round(mouseX/winDiff), Math.round(mouseY/winDiff)));
    }
  }
}

function compute() {
  // reset all the edges between the vertices
  for (let i = 0; i < points.length; i++) {
    points[i].adjacent = [];
  }
  // Saves the last input in case it becomes a highscore
  localStorage.setItem("last", JSON.stringify(points));

  // Calculate the collinear points
  collinearLine = maxCollinear(points);
  collinearLine[1] = points[collinearLine[1]];
  
  // Create the 'edges' between the points
  createVisibility(points);

  // Call to maxClique
  myClique = [];
  // Sort points by smallest degree first
  points.sort((a, b) => (a.adjacent.length > b.adjacent.length) ? 1 : -1);
  maxClique([], points.slice());

  let l = collinearLine[0]
  let k = myClique.length

  // Check if colourable with k colors and give colours to points
  let addStr;
  if (k_color(k, points)) {
    addStr = "Chromatic number and clique number are equivalent." 
  } else {
    addStr = "Chromatic number and clique number are different." 
  }

  // Update text under the canvas
  document.getElementById("result").innerHTML = `Collinear points (l) = ${l} \n` + 
  `Clique number = ${k} <br>` + addStr;

  if (l <= 6 && l >= 2 && k <=6 && k >= 2) {
    if (localStorage.getItem("l"+l+"k"+k) != null) {
      if (JSON.parse(localStorage.getItem("l"+l+"k"+k)).length < JSON.parse(localStorage.getItem("last")).length) {
        localStorage.setItem("l" + l + "k" + k, localStorage.getItem("last"));
      }
    } else {
      localStorage.setItem("l" + l + "k" + k, localStorage.getItem("last"));
    }
  }
}

function zoomOut() {
  winDiff = max(10, winDiff-5);
}

function zoomIn() {
  winDiff = min(50, winDiff+5);
}

// function to find maximum collinear points
function maxCollinear(points) {
  let N = points.length;
  let dict = new Map();
  if (N < 2) {
    return N;
  }

  // best[0] = number of collinear points;
  // best[1] = index of point;
  // best[2] = slope;
  let best = [0, 0, 0];
  let curBest, slope;

  // Looping over each point
  for (let i = 0; i < N; i++) {
    curBest = [0, 0, 0];
    // Looping from i + 1 to ignore same pair again
    for (let j = i+1; j < N; j++) {
      // Calculate slope
      if (points[i].x === points[j].x) {
        slope = Infinity;
      } else {
        slope = computeSlope(points[i], points[j]);
      }
      // Increment hashmap
      if (dict.has(slope)) {
        dict.set(slope, dict.get(slope) + 1);
      } else {
        dict.set(slope, 2);
      }
      if (curBest[0] < dict.get(slope)) {
        curBest = [dict.get(slope), j, slope];
      }
    }
    dict.clear();
    if (best[0] < curBest[0]) {
      best = curBest;
    }
  }
  return best;
}

// function that creates the visibility graph for points
function createVisibility (points) {
  let N = points.length;
  let dict = new Map();
  let neighbors;

  for (let i = 0; i < N; i++) {
    for (let j = 0; j < N; j++) {
      if (j != i) {
        if (points[i].x === points[j].x) {
          slope = Infinity;
        } else {
          slope = computeSlope(points[i], points[j]);
        }
        if (dict.has(slope)) {
          dict.get(slope).push(points[j]);
        } else {
          dict.set(slope, [points[j]]);
        }
      }
    }
    for (let [slope, list] of dict) {
       neighbors = nearestNeighbor(points[i], list);
      if (neighbors[0] != undefined) {
        points[i].adjacent.push(neighbors[0]);
      } if (neighbors[1] != undefined) {
         points[i].adjacent.push(neighbors[1]);
      }
    }
    dict.clear();
  }
}

// function to compute the nearest left and right neighbors in 1 dimension
// or up and down if the slope is Infinity
function nearestNeighbor (point, list) {
  let result = [undefined, undefined];
  for (item of list) {
    diff = point.x - item.x;
    // Point to the left
    if (diff > 0) {
      if (result[0] === undefined) {
        result[0] = item;
      } else {
        if (diff < point.x - result[0].x) {
          result[0] = item;
        }
      }
    } // Point to the right
    else if (diff < 0) {
      if (result[1] === undefined) {
        result[1] = item;
      } else {
        if (diff > point.x - result[1].x) {
          result[1] = item;
        }
      }
    } // Case on same x-axis
    else {
      diff = point.y - item.y;
      // Point below
      if (diff > 0) {
        if (result[0] === undefined) {
         result[0] = item;
        } else {
          if (diff < point.y - result[0].y) {
            result[0] = item;
          }
        }
      } // Point above
      else {
        if (result[1] === undefined) {
          result[1] = item;
        } else {
          if (diff > point.y - result[1].y) {
            result[1] = item;
          }
        }
      }
    }
  }
  return result;
}

// Function to compute the slope between 2 points
function computeSlope(p1, p2) {
  return (p2.y - p1.y) / (p2.x - p1.x);
}

let myClique = [];

//function to compute the maximal clique
function maxClique(C, P) {
  if (C.length > myClique.length) {
    myClique = C.slice();
  }

  if (C.length + P.length <= myClique.length) {
    return
  }
  while (P.length > 0) {
    p = P.pop();
    C_ = C.slice()
    C_.push(p);
    P_ = intersect(P, p.adjacent); //intersection of P and neighbors of p
    maxClique(C_, P_);
  }
}

function intersect(a, b) {
  var setB = new Set(b);
  return [...new Set(a)].filter(x => setB.has(x));
}

//function that returns if the graph is k-colorable
function k_color(m, G) {
  for (let i=0; i<G.length; i++) {
    G[i].colour = -1;
  }
  if (k_colorUtil(m, G, 0) === undefined) {
    return false;
  }
  return true;
}

// A recursive utility function to solve m colouring problem
function k_colorUtil(m, G, v) {
  if (v === G.length) {
    return true;
  }
  for (let c = 0; c < m; c++) {
    if (isColorable(G[v], c)) {
      G[v].colour = c;
      if (k_colorUtil(m, G, v+1) === true) {
        return true;
      }
      G[v].colour = -1;
    }
  }
}

// Returns true if vertex v is colourable with color c
function isColorable(v, c) {
  for (let i=0; i<v.adjacent.length; i++) {
    if (v.adjacent[i].colour === c) {
      return false;
    }
  }
  return true
}
