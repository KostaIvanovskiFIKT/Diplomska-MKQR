const qrCodeContainer = document.querySelector(".qrCode-container");
const modalScreen = document.querySelector(".modal-screen");
const qrScreen = document.querySelector(".qr-screen");
const filledData = document.querySelector(".filled-data");
const qrWidthHeight = document.querySelector(".qrCode-widthHeight");
const btnExitModalScreen = document.querySelector(".btn-modal-exit");
const btnContainer = document.querySelector(".btn-container");
const btnLowerRes = document.querySelector(".btn-lower-res");
const btnHigherRes = document.querySelector(".btn-higher-res");
const btnPNG = document.querySelector(".btn-PNG");
const btnJPEG = document.querySelector(".btn-JPEG");
const btnSVG = document.querySelector(".btn-SVG");
const btnWEBP = document.querySelector(".btn-WEBP");
const btnPreview = document.querySelector(".btn-preview");

let qrText = ""; // <--- This must NOT be changed here
let qrScale = 5; //Default value
let qrBorder = 3; //Default value

let canvasDefaultHeight;
let firstClickOnPreview = true;
const canvasMaxHeight = 805;

//Values below can be changed here
const type = 1; // QR type (can also be "MKD")
const version = "0100"; // Version of the specifications used in the QR (first 2 numbers are main version, second 2 numbers are the sub-version). This is type string because in javascript you cannot have leading zeros, otherwise, for example, 0100 would instead output 64
const characterSet = 2; // Character encoding (1 for UTF-8 latin restricted character set, 2 for UTF-8 with cyrillic character set)
const trailer = "EPD"; //Unambiguous indicator for the end of the payment data (EPD - End Payment Data)

const typeSpan = document.createElement("span");
const typeValueSpan = document.createElement("span");
typeSpan.innerText = "QR Тип";
typeSpan.classList.add("bold");
typeValueSpan.innerText = type;

const versionSpan = document.createElement("span");
const versionValueSpan = document.createElement("span");
versionSpan.innerText = "Верзија";
versionSpan.classList.add("bold");
versionValueSpan.innerText = version;

const characterSetSpan = document.createElement("span");
const characterSetValueSpan = document.createElement("span");
characterSetSpan.innerText = "Енкодирање карактери";
characterSetSpan.classList.add("bold");
characterSetValueSpan.innerText = characterSet;

const trailerSpan = document.createElement("span");
const trailerValueSpan = document.createElement("span");
trailerSpan.innerText = "Трејлер";
trailerSpan.classList.add("bold");
trailerValueSpan.innerText = trailer;

const wrapDiv1 = document.createElement("div");
wrapDiv1.appendChild(typeSpan);
wrapDiv1.append(": ");
wrapDiv1.appendChild(typeValueSpan);
const wrapDiv2 = document.createElement("div");
wrapDiv2.appendChild(versionSpan);
wrapDiv2.append(": ");
wrapDiv2.appendChild(versionValueSpan);
const wrapDiv3 = document.createElement("div");
wrapDiv3.appendChild(characterSetSpan);
wrapDiv3.append(": ");
wrapDiv3.appendChild(characterSetValueSpan);
const wrapDiv4 = document.createElement("div");
wrapDiv4.appendChild(trailerSpan);
wrapDiv4.append(": ");
wrapDiv4.appendChild(trailerValueSpan);

const wrapDivAll = document.createElement("div");
wrapDivAll.classList.add("stats-style");

wrapDivAll.appendChild(wrapDiv1);
wrapDivAll.appendChild(wrapDiv2);
wrapDivAll.appendChild(wrapDiv3);
wrapDivAll.appendChild(wrapDiv4);

btnContainer.appendChild(wrapDivAll);

btnPreview.addEventListener("click", (e) => {
  e.preventDefault();

  //Here can be changed the names of the keys and values as well as their order
  const fieldsObj = {
    t: type,
    v: version,
    c: characterSet,
    iban: document.getElementById("creditorAccount").value,
    aiban: document.getElementById("creditorAccountAlt").value,
    cat: document.getElementById("creditorAdressType").value,
    cn: document.getElementById("creditorName").value,
    cadd1: document.getElementById("creditorAdressLine1").value,
    cadd2: document.getElementById("creditorAdressLine2").value,
    cz: document.getElementById("creditorPostalCode").value,
    cg: document.getElementById("creditorTown").value,
    cc: document.getElementById("creditorCountry").value,
    a: document.getElementById("paymentAmount").value,
    cur: document.getElementById("paymentCurrency").value,
    pat: document.getElementById("debtorAdressType").value,
    pn: document.getElementById("debtorName").value,
    paddr1: document.getElementById("debtorAdressLine1").value,
    paddr2: document.getElementById("debtorAdressLine2").value,
    pz: document.getElementById("debtorPostalCode").value,
    pg: document.getElementById("debtorTown").value,
    pc: document.getElementById("debtorCountry").value,
    rt: document.getElementById("paymentType").value,
    ref: document.getElementById("paymentReference").value,
    ustrd_PLACEHOLDER: document.getElementById("paymentUnstructuredMsg").value,
    strdBkgInf_PLACEHOLDER: document.getElementById("paymentBillInformation").value,
    curl: document.getElementById("paymentWebsiteURL").value,
    ap: document.getElementById("paymentAltParameters").value,
    av: document.getElementById("paymentAltValues").value,
    ad: document.getElementById("paymentAltDescription").value,
    ac: document.getElementById("paymentAltCurrency").value,
    pc: document.getElementById("aInfoPaymentCode").value,
    nac: document.getElementById("aInfoPaymentType").value,
    us: document.getElementById("aInfoPP50PaymentAccount").value,
    usek: document.getElementById("aInfoPP50SingleUserAccount").value,
    ps: document.getElementById("aInfoPP50IncomeCode").value,
    pr: document.getElementById("aInfoPP50Program").value,
    trailer_PLACEHOLDER: trailer,
  };

  let keys = Object.keys(fieldsObj);
  let values = Object.values(fieldsObj);

  for (let i = 0; i < keys.length; i++) {
    if (i !== keys.length - 1) {
      qrText = qrText + keys[i] + "=" + values[i] + "&";
    } else {
      qrText = qrText + values[i];
    }
  }

  console.log(encodeURI(qrText)); //Test purposes
  drawQrCode("display-block");

  const labels = document.querySelectorAll("label");
  const inputs = document.querySelectorAll(".input-style, .input-style-select");

  for (let i = 0; i < labels.length; i++) {
    if (inputs[i].value) {
      const p = document.createElement("p");
      const spanLabel = document.createElement("span");
      const spanInputValue = document.createElement("span");
      spanLabel.classList.add("span-label-data");
      spanInputValue.classList.add("span-input-data");
      p.classList.add("p-data-style");
      spanLabel.innerText = labels[i].innerText;
      if (inputs[i].options) {
        spanInputValue.innerText = inputs[i].options[inputs[i].selectedIndex].innerText;
      } else {
        spanInputValue.innerText = inputs[i].value;
      }
      p.appendChild(spanLabel);
      p.append(": ");
      p.appendChild(spanInputValue);
      filledData.appendChild(p);
    } else {
      continue;
    }
  }

  modalScreen.classList.add("display-toggle");
  qrScreen.classList.add("display-toggle-flex");

  const canvas = document.querySelector("canvas");
  qrWidthHeight.innerText = canvas.width + "x" + canvas.height;
  if (firstClickOnPreview) canvasDefaultHeight = canvas.height;
  firstClickOnPreview = false;
});

btnHigherRes.addEventListener("click", () => {
  qrScale = qrScale + 1;
  refreshQR("display-none");
  const canvas = document.querySelector("canvas");
  if (canvas.height > canvasMaxHeight) {
    qrScale = qrScale - 1;
    refreshQR("display-block");
  } else {
    refreshQR("display-block");
  }
});

btnLowerRes.addEventListener("click", () => {
  const canvas = document.querySelector("canvas");
  if (canvas.height > canvasDefaultHeight) {
    qrScale = qrScale - 1;
    refreshQR("display-block");
  } else {
    return;
  }
});

btnPNG.addEventListener("click", () => {
  const imgPNG = document.querySelector("canvas");
  const dataURL = imgPNG.toDataURL("image/png");
  btnPNG.setAttribute("href", dataURL);
  const canvas = document.querySelector("canvas");
  btnPNG.setAttribute("download", "MKQR_" + canvas.width + "x" + canvas.height);
});

btnJPEG.addEventListener("click", () => {
  const imgJPEG = document.querySelector("canvas");
  const dataURL = imgJPEG.toDataURL("image/jpeg");
  btnJPEG.setAttribute("href", dataURL);
  const canvas = document.querySelector("canvas");
  btnJPEG.setAttribute("download", "MKQR_" + canvas.width + "x" + canvas.height);
});

btnWEBP.addEventListener("click", () => {
  const imgWEBP = document.querySelector("canvas");
  const dataURL = imgWEBP.toDataURL("image/webp");
  btnWEBP.setAttribute("href", dataURL);
  const canvas = document.querySelector("canvas");
  btnWEBP.setAttribute("download", "MKQR_" + canvas.width + "x" + canvas.height);
});

// Modal screen
btnExitModalScreen.addEventListener("click", () => {
  qrText = "";
  modalScreen.classList.remove("display-toggle");
  qrCodeContainer.removeChild(qrCodeContainer.firstChild);
  qrScreen.classList.remove("display-toggle-flex");

  while (filledData.firstChild) {
    filledData.removeChild(filledData.firstChild);
  }
});

// Functions

function refreshQR(className) {
  qrCodeContainer.removeChild(qrCodeContainer.firstChild);
  drawQrCode(className);
  const canvas = document.querySelector("canvas");
  qrWidthHeight.innerText = canvas.width + "x" + canvas.height;
}

// Setup for the QR
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

function appendCanvas(className) {
  let result = document.createElement("canvas");
  result.classList.add(className);
  qrCodeContainer.appendChild(result);
  return result;
}

// Creating the QR
function drawQrCode(className) {
  let text = encodeURI(qrText); //Text to encode to the QR code

  const errCorrLvl = qrcodegen.QrCode.Ecc.MEDIUM; //Error correction level
  // LOW - The QR Code can tolerate about  7% erroneous codewords
  // MEDIUM - The QR Code can tolerate about 15% erroneous codewords
  // QUARTILE - The QR Code can tolerate about 25% erroneous codewords
  // HIGH - The QR Code can tolerate about 30% erroneous codewords

  const qrCode = qrcodegen.QrCode.encodeText(text, errCorrLvl);

  drawCanvas(qrCode, qrScale, qrBorder, "#FFFFFF", "#000000", appendCanvas(className));
}
