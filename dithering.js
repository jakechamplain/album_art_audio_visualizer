function DitheredPoint(x, y, pColor, bdv) {
    this.x = x;
    this.y = y;
    this.pointColor = pColor;
    this.bitDepthVal = bdv;

    this.drawPoint = (s) => {
        fill(this.pointColor);
        rect(this.x, this.y, s, s);
    }
}