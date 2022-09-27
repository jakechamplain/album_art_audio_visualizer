var img;

function preload() {
     img = loadImage('minnie.jpg');
    //img = loadImage('cattail_boys_cover.png');
}

function fitImageToCanvas() {
    if (img.width >= width) img.resize(width, 0);
    if (img.height >= height) img.resize(0, height);
}

function findNewWidthAndHeight(scale) {
    let newWidth, newHeight;
    if (img.width >= img.height) {
        newWidth = img.width / scale;
        newHeight = 0;
    } else {
        newHeight = img.height / scale;
        newWidth = 0;
    }
    img.resize(newWidth, newHeight);
    //img.resize(oldWidth / 1.5, oldHeight / 1.5);
}

function setup() {
    createCanvas(windowWidth, windowHeight);
    //background(11, 37, 69);
    background(10, 20, 40);
    var scale = 10;
    fitImageToCanvas();
    var oldW = round(img.width / 1.2);
    var oldH = round(img.height / 1.2);
    imageMode(CENTER);
    findNewWidthAndHeight(scale);
    console.log(oldW, oldH, img.width, img.height);
    noStroke();
    //strokeWeight(scale);
    //image(img, width / 2, height / 2, oldW, oldH);

    //image(img, width / 2, height / 2);
    fsDither(oldW, oldH, scale);
    noLoop();
}

function pixIndex(x, y) {
    return (x + y * img.width) * 4;
}

function getPixelColor(x, y) {
    let r = img.pixels[pixIndex(x, y)];
    let g = img.pixels[pixIndex(x, y) + 1];
    let b = img.pixels[pixIndex(x, y) + 2];
    let a = img.pixels[pixIndex(x, y) + 3];

    return color(r, g, b, a);
}

function setPixelColor(x, y, newColor) {
    img.pixels[pixIndex(x, y)] = red(newColor);
    img.pixels[pixIndex(x, y) + 1] = green(newColor);
    img.pixels[pixIndex(x, y) + 2] = blue(newColor);
}

function fsDither(oldW, oldH, scale) {
    let pColor, avgBright, newBright, rError, gError, bError;

    img.loadPixels();

    for (let x = 0; x < img.width; x++) {
        for (let y = 0; y < img.height; y++) {
            pColor = getPixelColor(x, y);
            //avgBright = (red(pColor) * 0.3 + green(pColor) * 0.59 + blue(pColor) * 0.11);
            avgBright = (red(pColor) + green(pColor) + blue(pColor)) / 3;
            newBright = round(4 * avgBright / 255) * round(255 / 4);
            rError = red(pColor) - newBright;
            gError = green(pColor) - newBright;
            bError = blue(pColor) - newBright;
          
            diffuseError(x, y, rError, gError, bError);

            //if (newBright / 64 === 0) stroke(10, 20, 40);
            if (newBright / 64 === 1) fill(16, 32, 64);//stroke(16, 32, 64);//stroke(26, 56, 91);
            if (newBright / 64 === 2) fill(32, 64, 128);//stroke(32, 64, 128);//stroke(19, 64, 116);
            if (newBright / 64 === 3) fill(48, 96, 192);//stroke(48, 96, 192);//stroke(90, 136, 189);
            if (newBright / 64 === 4) fill(64, 128, 255);//stroke(64, 128, 255);//stroke(149, 184, 209);

            if (newBright > 0) {
                xPos = (windowWidth / 2) - (oldW / 2) + map(x, 0, img.width, 0, oldW);
                yPos = (windowHeight / 2) - (oldH / 2) + map(y, 0, img.height, 0, oldH);
                //point(xPos, yPos);
                rect(xPos, yPos, scale, scale);
            }
        }
    }
    //img.updatePixels();
    //image(img, width / 2, height / 2, originalW / 1.5, originalH / 1.5);
}

function diffuseError(x, y, rError, gError, bError) {
    addError(x + 1, y    , 7/ 16.0, rError, gError, bError);
    addError(x - 1, y + 1, 3/ 16.0, rError, gError, bError);
    addError(x    , y + 1, 5/ 16.0, rError, gError, bError);
    addError(x + 1, y + 1, 1/ 16.0, rError, gError, bError);
}

function addError(x, y, factor, rError, gError, bError) {
    if (x < 0 || y < 0 || x > img.width || y > img.height) return;

    let originalColor = getPixelColor(x, y);
    let newR = red(originalColor) + rError * factor;
    let newG = green(originalColor) + gError * factor;
    let newB = blue(originalColor) + bError * factor;
    
    setPixelColor(x, y, color(newR, newG, newB));
}

function draw() {
    
}