const qrCodeContainer = document.querySelector(".qrCode-container");

drawQrCode();

function drawCanvas(qr, scale, border, lightColor, darkColor, canvas) {
  if (scale <= 0 || border < 0) throw "Value out of range";
  const width = (qr.size + border * 2) * scale;
  canvas.width = width;
  canvas.height = width;
  let ctx = canvas.getContext("2d");
  for (let y = -border; y < qr.size + border; y++) {
    for (let x = -border; x < qr.size + border; x++) {
      ctx.fillStyle = qr.getModule(x, y) ? darkColor : lightColor;
      ctx.fillRect((x + border) * scale, (y + border) * scale, scale, scale);
    }
  }
}

function appendCanvas(caption) {
  let p = qrCodeContainer.appendChild(document.createElement("p"));
  p.textContent = caption + ":";
  let result = document.createElement("canvas");
  qrCodeContainer.appendChild(result);
  return result;
}

function drawQrCode() {
  let text = "placeholderfornow"; //Placeholder
  const errCorrLvl = qrcodegen.QrCode.Ecc.MEDIUM;

  const qrCode = qrcodegen.QrCode.encodeText(text, errCorrLvl);

  drawCanvas(qrCode, 10, 4, "#FFFFFF", "#000000", appendCanvas(""));
}
