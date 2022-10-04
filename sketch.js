var img, audioFile;
var oldImgW, oldImgH, scaleBy;
var noisy, togglePlay, fft;
var dithered = [];
var colorBitDepth = 4;

function preload() {
     img = loadImage('minnie.jpg');
}

function fitImageToCanvas() {
    if (img.width >= width) img.resize(width, 0);
    if (img.height >= height) img.resize(0, height);
}

function findNewWidthAndHeight() {
    let newWidth, newHeight;
    if (img.width >= img.height) {
        newWidth = img.width / scaleBy;
        newHeight = 0;
    } else {
        newHeight = img.height / scaleBy;
        newWidth = 0;
    }
    img.resize(newWidth, newHeight);
}

function setup() {
    createCanvas(windowWidth, windowHeight);
    noisy = new p5.Noise('brown');
    noisy.amp(0.1);

    fft = new p5.FFT();
    scaleBy = 5;
    fitImageToCanvas();
    oldImgW = round(img.width / 1.2);
    oldImgH = round(img.height / 1.2);
    imageMode(CENTER);
    findNewWidthAndHeight();

    
    togglePlay = createButton('play');
    togglePlay.position((width - oldImgW) / 5, height / 2);
    togglePlay.mousePressed(() => {
        if (noisy.started) {
            noisy.stop();
            togglePlay.html('play');
        } else {
            noisy.start();
            togglePlay.html('stop');
        }
    })
    //console.log(oldImgW, oldImgH, img.width, img.height);
    noStroke();
    
    fsDither(oldImgW, oldImgH);
    //noLoop();
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

function fsDither(oldW, oldH) {
    let pColor, avgBright, newBright, rError, gError, bError, newColor;

    img.loadPixels();

    for (let x = 0; x < img.width - 1; x++) {
        for (let y = 0; y < img.height - 1; y++) {
            pColor = getPixelColor(x, y);
            //avgBright = (red(pColor) * 0.3 + green(pColor) * 0.59 + blue(pColor) * 0.11);
            avgBright = (red(pColor) + green(pColor) + blue(pColor)) / 3;
            newBright = round((colorBitDepth - 1) * avgBright / 255) * round(255 / (colorBitDepth - 1));
            rError = red(pColor) - newBright;
            gError = green(pColor) - newBright;
            bError = blue(pColor) - newBright;
          
            diffuseError(x, y, rError, gError, bError);

            //colors will eventually need be to generative
            //based on user input
            if (newBright / 85 === 0) newColor = color(8, 16, 42);
            if (newBright / 85 === 1) newColor = color(16, 32, 85);
            if (newBright / 85 === 2) newColor = color(32, 64, 170);
            if (newBright / 85 === 3) newColor = color(48, 96, 255);

            xPos = (windowWidth / 2) - (oldW / 2) + map(x, 0, img.width, 0, oldW);
            yPos = (windowHeight / 2) - (oldH / 2) + map(y, 0, img.height, 0, oldH);
            
            dithered.push(new DitheredPoint(xPos, yPos, newColor, newBright / 85));
            //dithered[dithered.length - 1].drawPoint(scaleBy);
        }
    }
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
    fft.analyze();
    background(20);

    //current arguments for function below result in
    // the number of bands I need for this example
    // must figure out way to calculate based on diff input
    let oBands = fft.getOctaveBands(0.3, 20);
    let logAvgs = fft.logAverages(oBands);
    //idea: make class that stores "pixel" or point data of 
    // to-be displayed image, and have the "brightness" as an
    // internal class var, to be ref'd in the spectrum loop 
    

    for (let z = 0; z < dithered.length; z++) {
        let pointSize = noisy.started ? ceil(map(logAvgs[dithered[z].bitDepthVal], 0, 255, 1, scaleBy)) : scaleBy;
        dithered[z].drawPoint(pointSize);
        //let alphaVal = noisy.started ? round(logAvgs[dithered[z].bitDepthVal]) : 255;
        //if (z === 0) console.log(alphaVal);
        dithered[z].drawPoint(pointSize);
    }
    //fsDither(oldImgW, oldImgH, scaleBy);
}