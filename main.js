const qrCodeContainer = document.querySelector(".qrCode-container");
const modalScreen = document.querySelector(".modal-screen");

let qrText = "";

let btnSubmit = document.querySelector(".btn-preview").addEventListener("click", (e) => {
  e.preventDefault();

  const fieldsObj = {
    t: 1,
    v: 200,
    c: 1,
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
    trailer_PLACEHOLDER: "EPD",
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
  };

  let keys = Object.keys(fieldsObj);
  let values = Object.values(fieldsObj);

  for (let i = 0; i < keys.length; i++) {
    if (i !== keys.length - 1) {
      qrText = qrText + keys[i] + "=" + values[i] + "&";
    } else {
      qrText = qrText + keys[i] + "=" + values[i];
    }
  }

  console.log(encodeURI(qrText)); //Test purposes
  drawQrCode();
  qrText = "";

  modalScreen.classList.add("display-toggle");
  qrCodeContainer.classList.add("display-toggle");
});

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

function drawQrCode() {
  let text = encodeURI(qrText); //Text to encode to the QR code
  const errCorrLvl = qrcodegen.QrCode.Ecc.MEDIUM;

  const qrCode = qrcodegen.QrCode.encodeText(text, errCorrLvl);

  drawCanvas(qrCode, 3, 4, "#FFFFFF", "#000000", appendCanvas());
}
