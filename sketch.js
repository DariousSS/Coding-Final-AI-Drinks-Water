// Reference
//createGraphics() from: https://p5js.org/reference/p5/createGraphics/
//randomseed() from: https://p5js.org/reference/p5/randomSeed/
//windowResized() from: https://p5js.org/reference/p5/windowResized/
//copy() from: https://p5js.org/reference/p5/copy/
//save() from: https://p5js.org/reference/p5/save/
//mouseDragged() from: https://p5js.org/reference/p5/mouseDragged/
//mouseReleased()from: https://p5js.org/reference/p5/mouseReleased/
//constrain() form: https://p5js.org/reference/p5/constrain/

//select() from: https://p5js.org/reference/p5/select/
//value() from: https://p5js.org/reference/p5.Element/value/
//html() from: https://p5js.org/reference/p5.Element/html/
//show() from: https://p5js.org/reference/p5.Element/show/
//add class() from: https://p5js.org/reference/p5.Element/addClass/
//remove class() from: https://p5js.org/reference/p5.Element/removeClass/

//p5.FFT from: https://p5js.org/reference/p5.sound/p5.FFT/

//.split() from: https://www.w3schools.com/jsref/jsref_split.asp
//.trim from: https://www.w3schools.com/jsref/jsref_trim_string.asp


let font;
let sound, digital, fft;
let isPlaying = false;
let digitalPlaying = false;
let waterAmount = 0;

// particles
let x = [], y = [], vx = [], vy = [], sizes = [];
let alpha;

// shapes
let rackData = [];
let arcData = [];

// preview box
let pg;
let PW, PH;
let boxX, boxY;
let isDragging = false;
let dragEdge = '';
let dragOffsetX, dragOffsetY;

function preload() {
  font = loadFont("PlayfairDisplay-Italic-VariableFont_wght.ttf");
  sound = loadSound("water.mp3");
  digital = loadSound("digital.mp3");
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);
  noStroke();
  textAlign(CENTER, CENTER);
  textFont(font);
  fft = new p5.FFT();

  PW = int(min(windowWidth * 0.65, 700));
  PH = int(min(windowHeight * 0.45, 420));
  boxX = int(width / 2 - PW / 2);
  boxY = int(height - 260 - PH);
  pg = createGraphics(PW, PH);
  pg.textAlign(CENTER, CENTER);
  pg.textFont(font);
  pg.noStroke();

  buildBackgroundShapes();

  let panelCollapsed = false;

  select('#analyze-btn').mousePressed(function() {
    let txt = select('#convo-input').value();
    if (!txt) return;
    let words = txt.split(' ').length;
    let tokens = int(words * 1.3);
    let water = int(tokens * 0.5);
    select('#result').html('~' + tokens + ' tokens  →  ~' + water + ' ml of water consumed');
    setWaterAmount(water);
    select('#toggle-btn').show();
    select('#save-btn').show();
  });

  select('#toggle-btn').mousePressed(function() {
    let panel = select('#input-panel');
    if (panelCollapsed) {
      panel.removeClass('collapsed');
    } else {
      panel.addClass('collapsed');
    }
    panelCollapsed = !panelCollapsed;
  });
}

function buildBackgroundShapes() {
  rackData = [];
  arcData = [];
  randomSeed(77);
  for (let i = 0; i < 50; i++) {
    let horiz = random() > 0.5;
    let rw, rh;
    if (horiz) {
      rw = random(60, 180);
      rh = random(5, 12);
    } else {
      rw = random(6, 14);
      rh = random(60, 180);
    }
    rackData.push({
      x: random(PW), y: random(PH),
      w: rw,
      h: rh,
      horiz: horiz,
      toothSize: random(4, 9), toothGap: random(8, 16),
      cr: random(0, 60), cg: random(20, 100), cb: random(60, 180)
    });
  }
  for (let i = 0; i < 20; i++) {
    arcData.push({
      cx: random(PW * 0.1, PW * 0.9),
      cy: random(PH * 0.2, PH * 1.1),
      r: random(min(PW, PH) * 0.15, min(PW, PH) * 0.5),
      depth: int(random(3, 6)),
      start: random(TWO_PI),
      span: random(HALF_PI, PI * 1.8),
      cr: random(20, 80), cg: random(60, 180), cb: random(100, 220),
      rotSpeed: random(-0.002, 0.002)
    });
  }
  randomSeed();
}

// H2O particles
function generateLetters() {
  x = []; y = []; vx = []; vy = []; sizes = [];
  let count = int(map(constrain(waterAmount, 0, 500), 0, 500, 40, 200));
  alpha = 180;
  for (let i = 0; i < count; i++) {
    x.push(random(PW));
    y.push(random(-PH, PH));
    vx.push(random(-0.5, 0.5));
    vy.push(random(0.5, 2));
    sizes.push(map(constrain(waterAmount, 0, 500), 0, 500, 20, 9));
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  PW = int(min(windowWidth * 0.65, 700));
  PH = int(min(windowHeight * 0.45, 420));
  boxX = int(width / 2 - PW / 2);
  boxY = int(height - 260 - PH);
  pg.resizeCanvas(PW, PH);
  pg.textAlign(CENTER, CENTER);
  pg.textFont(font);
  buildBackgroundShapes();
  if (waterAmount > 0) generateLetters();
}

function draw() {
  background(250);

  // music grid
  let spectrum = fft.analyze();
  let cols = 24, rows = 14;
  let sw = width / cols, sh = height / rows;
  for (let col = 0; col < cols; col++) {
    let amp = spectrum[int(map(col, 0, cols, 0, spectrum.length / 3))];
    for (let row = 0; row < rows; row++) {
      let bv = map(amp, 0, 255, 240, 200);
      let sz = map(amp, 0, 255, sw * 0.3, sw * 0.8);
      fill(bv, bv, bv + 10, 180);
      rect(col * sw + sw / 2 - sz / 2, row * sh + sh / 2 - sz / 2, sz, sz, 4);
    }
  }

  if (waterAmount === 0) {
    fill(80);
    noStroke();
    textSize(32);
    text("AI Drinks Water", width / 2, height / 2 - 60);
    textSize(15);
    fill(140);
    text("Every AI query has a hidden cost.", width / 2, height / 2 - 15);
    text("Paste a conversation below to see how much water it consumed.", width / 2, height / 2 + 15);
    return;
  }

  let stress = constrain(map(waterAmount, 0, 500, 0, 1), 0, 1);

  if (stress > 0.7 && !digitalPlaying) { digital.loop(); digitalPlaying = true; }
  if (stress <= 0.7 && digitalPlaying) { digital.stop(); digitalPlaying = false; }

  pg.background(250);

  let cr = lerp(126, 50, stress);
  let cg = lerp(217, 80, stress);
  let cb = lerp(237, 110, stress);
  let fallSpeed = map(constrain(waterAmount, 0, 500), 0, 500, 0.3, 1.8);

  let mxPg = mouseX - boxX;
  let myPg = mouseY - boxY;

  // falling H2O
  for (let i = 0; i < x.length; i++) {
    let d = dist(x[i], y[i], mxPg, myPg);
    if (d < 80 && d > 0) {
      let force = (1 - d / 80) * 1.2;
      vx[i] += ((x[i] - mxPg) / d) * force;
      vy[i] += ((y[i] - myPg) / d) * force * 0.3;
    }
    vy[i] += 0.015 * fallSpeed;
    vx[i] *= 0.95;
    vy[i] = constrain(vy[i], -2, fallSpeed * 2);
    x[i] += vx[i];
    y[i] += vy[i];
    if (y[i] > PH + 20) {
      x[i] = random(PW);
      y[i] = random(-50, -10);
      vx[i] = random(-0.5, 0.5);
      vy[i] = random(0.5, 1.5);
    }
    if (x[i] < -20) x[i] = PW + 10;
    if (x[i] > PW + 20) x[i] = -10;
    pg.noStroke();
    pg.textSize(sizes[i]);
    pg.fill(cr, cg, cb, alpha);
    pg.text("H2O", x[i], y[i]);
  }

  // arcs
  let arcCount = int(map(constrain(waterAmount, 0, 500), 0, 500, 1, arcData.length));
  let arcAlpha = constrain(map(waterAmount, 0, 500, 40, 160), 40, 160);
  for (let i = 0; i < arcCount; i++) {
    let ad = arcData[i];
    ad.start += ad.rotSpeed;
    drawArcs(ad.cx, ad.cy, ad.r, ad.depth, arcAlpha, ad.start,
      map(constrain(waterAmount, 0, 500), 0, 500, HALF_PI, ad.span),
      ad.cr, ad.cg, ad.cb);
  }

  // server racks
  let rackCount = int(map(constrain(waterAmount, 0, 500), 0, 500, 0, rackData.length));
  let rackAlpha = constrain(map(waterAmount, 0, 500, 20, 100), 20, 100);
  for (let i = 0; i < rackCount; i++) {
    let rk = rackData[i];
    pg.noStroke();
    let hr = lerp(rk.cr, random(180, 255), stress);
    let hg = lerp(rk.cg, random(10, 70), stress);
    let hb = lerp(rk.cb, random(0, 40), stress);
    pg.fill(hr, hg, hb, rackAlpha * 0.7);
    pg.rect(rk.x, rk.y, rk.w, rk.h, 2);
    if (rk.horiz) {
      let cnt = int(rk.w / rk.toothGap);
      for (let t = 0; t < cnt; t++) {
        pg.fill(hr + 30, hg + 30, hb + 30, rackAlpha);
        pg.rect(rk.x + t * rk.toothGap + rk.toothGap * 0.3, rk.y - rk.toothSize, rk.toothSize * 0.6, rk.toothSize, 1);
      }
    } else {
      let cnt = int(rk.h / rk.toothGap);
      for (let t = 0; t < cnt; t++) {
        pg.fill(hr + 30, hg + 30, hb + 30, rackAlpha);
        pg.rect(rk.x + rk.w, rk.y + t * rk.toothGap + rk.toothGap * 0.3, rk.toothSize, rk.toothSize * 0.6, 1);
      }
    }
    if (stress > 0.4 && random() < stress * 0.3) {
      pg.fill(255, random(50, 150), 0, random(100, 200));
      pg.rect(rk.x + random(-20, rk.w + 20), rk.y + random(-20, rk.h + 20), random(3, 12), random(3, 12));
    }
  }

  // glitch
  if (stress > 0.3) {
    for (let g = 0; g < int(map(stress, 0.3, 1, 1, 6)); g++) {
      if (random() < stress * 0.6) {
        let gy = random(PH);
        let gh = random(3, map(stress, 0.3, 1, 8, 30));
        pg.copy(0, gy, PW, gh, random(-map(stress, 0.3, 1, 8, 40), map(stress, 0.3, 1, 8, 40)), gy, PW, gh);
      }
    }
  }

  // show pg
  stroke(200);
  strokeWeight(1);
  noFill();
  rect(boxX, boxY, PW, PH, 8);
  noStroke();
  image(pg, boxX, boxY);

  // edge handles
  let handleY = boxY + PH / 2;
  fill(180, 220, 235, 200);
  noStroke();
  rect(boxX - 10, handleY - 20, 10, 40, 4);
  rect(boxX + PW, handleY - 20, 10, 40, 4);
  fill(120);
  for (let d = -12; d <= 12; d += 6) {
    ellipse(boxX - 5, handleY + d, 3, 3);
    ellipse(boxX + PW + 5, handleY + d, 3, 3);
  }

  // 💧 drag icon below the box
  if (waterAmount > 0) {
    textSize(20);
    fill(126, 217, 237, 220);
    noStroke();
    text('💧', boxX + PW / 2, boxY + PH + 20);
  }
}

// recursive arc
function drawArcs(cx, cy, r, depth, a, start, span, acr, acg, acb) {
  if (depth === 0 || r < 5) return;
  pg.noFill();
  let steps = int(span * 18);
  for (let s = 0; s < steps; s++) {
    let t1 = start + (span / steps) * s;
    let t2 = start + (span / steps) * (s + 1);
    let n1 = noise(cos(t1) + cx * 0.003, sin(t1) + cy * 0.003, r * 0.01);
    let n2 = noise(cos(t2) + cx * 0.003, sin(t2) + cy * 0.003, r * 0.01);
    let jitter = r * 0.06;
    let x1 = cx + (r + map(n1, 0, 1, -jitter, jitter)) * cos(t1);
    let y1 = cy + (r + map(n1, 0, 1, -jitter, jitter)) * sin(t1);
    let x2 = cx + (r + map(n2, 0, 1, -jitter, jitter)) * cos(t2);
    let y2 = cy + (r + map(n2, 0, 1, -jitter, jitter)) * sin(t2);
    pg.stroke(acr, acg, acb, a);
    pg.strokeWeight(map(n1, 0, 1, 0.5, 3.5));
    pg.line(x1, y1, x2, y2);
  }
  drawArcs(cx, cy, r * 0.65, depth - 1, a * 0.85, start, span, acr, acg, acb);
}

function setWaterAmount(ml) {
  waterAmount = ml;
  generateLetters();
}

function saveViz() {
  pg.save('water-viz.png');
}

function mousePressed() {
  if (!isPlaying) {
    sound.loop();
    isPlaying = true;
  }
  if (waterAmount === 0) return;
  let edgeSize = 16;
  let dropX = boxX + PW / 2;
  let dropY = boxY + PH + 20;
  // drag the 💧 icon to move the whole box
  if (dist(mouseX, mouseY, dropX, dropY) < 24) {
    isDragging = true;
    dragEdge = 'move';
    dragOffsetX = mouseX - boxX;
    dragOffsetY = mouseY - boxY;
  // drag right edge to resize width
  } else if (abs(mouseX - (boxX + PW)) < edgeSize && mouseY > boxY && mouseY < boxY + PH) {
    isDragging = true;
    dragEdge = 'right';
  // drag bottom edge to resize height
  } else if (abs(mouseY - (boxY + PH)) < edgeSize && mouseX > boxX && mouseX < boxX + PW) {
    isDragging = true;
    dragEdge = 'bottom';
  }
}

function mouseDragged() {
  if (!isDragging) return;
  if (dragEdge === 'move') {
    boxX = constrain(mouseX - dragOffsetX, 0, windowWidth - PW);
    boxY = constrain(mouseY - dragOffsetY, 0, windowHeight - PH - 50);
  } else if (dragEdge === 'right') {
    PW = constrain(mouseX - boxX, 200, windowWidth - boxX - 10);
    pg.resizeCanvas(PW, PH);
    pg.textAlign(CENTER, CENTER);
    pg.textFont(font);
    buildBackgroundShapes();
    if (waterAmount > 0) generateLetters();
  } else if (dragEdge === 'bottom') {
    PH = constrain(mouseY - boxY, 100, windowHeight - boxY - 60);
    pg.resizeCanvas(PW, PH);
    pg.textAlign(CENTER, CENTER);
    pg.textFont(font);
    buildBackgroundShapes();
    if (waterAmount > 0) generateLetters();
  }
}

function mouseReleased() {
  isDragging = false;
  dragEdge = '';
}
