const qrCodeContainer = document.querySelector(".qrCode-container");
const modalScreen = document.querySelector(".modal-screen");
const qrScreen = document.querySelector(".qr-screen");
const filledData = document.querySelector(".filled-data");

let qrText = ""; // <--- This must NOT be changed here

//Values below can be changed here
const type = 1; // QR type (can also be "MKD")
const version = "0100"; // Version of the specifications used in the QR (first 2 numbers are main version, second 2 numbers are the sub-version). This is type string because in javascript you cannot have leading zeros, otherwise, for example, 0100 would instead output 64
const characterSet = 2; // Coding type (1 for UTF-8 latin restricted character set, 2 for UTF-8 with cyrillic character set)
const trailer = "EPD"; //Unambiguous indicator for the end of the payment data (EPD - End Payment Data)

let btnSubmit = document.querySelector(".btn-preview").addEventListener("click", (e) => {
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
  drawQrCode();
  qrText = "";

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
      p.append(":  ");
      p.appendChild(spanInputValue);
      filledData.appendChild(p);
    } else {
      continue;
    }
  }

  modalScreen.classList.add("display-toggle");
  qrScreen.classList.add("display-toggle-flex");
});

// Modal screen
modalScreen.addEventListener("click", () => {
  modalScreen.classList.remove("display-toggle");
  qrCodeContainer.removeChild(qrCodeContainer.firstChild);
  qrScreen.classList.remove("display-toggle-flex");

  while (filledData.firstChild) {
    filledData.removeChild(filledData.firstChild);
  }
});

// Functions

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

function appendCanvas() {
  let result = document.createElement("canvas");
  qrCodeContainer.appendChild(result);
  return result;
}

// Creating the QR
function drawQrCode() {
  let text = encodeURI(qrText); //Text to encode to the QR code

  const errCorrLvl = qrcodegen.QrCode.Ecc.MEDIUM; //Error correction level
  // LOW - The QR Code can tolerate about  7% erroneous codewords
  // MEDIUM - The QR Code can tolerate about 15% erroneous codewords
  // QUARTILE - The QR Code can tolerate about 25% erroneous codewords
  // HIGH - The QR Code can tolerate about 30% erroneous codewords

  const qrCode = qrcodegen.QrCode.encodeText(text, errCorrLvl);

  drawCanvas(qrCode, 5, 3, "#FFFFFF", "#000000", appendCanvas());
}
