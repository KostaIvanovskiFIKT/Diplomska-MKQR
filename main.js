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
const listOfFields = document.querySelectorAll(".input-style, .input-style-select");
const creditorSelect = document.getElementById("creditorAdressType");
const debtorSelect = document.getElementById("debtorAdressType");
const referenceType = document.getElementById("paymentType");
let qrText = ""; // Не смее да се промени тука
let canvasDefaultHeight; // Не смее да се промени тука
let firstClickOnPreview = true; // Не смее да се промени тука
let svgUrl; // Не смее да се промени тука
//---------------------------------------------------------------------------------------------------------------

// Користејќи го копчето за зголемување/намалување на QR кодот, се менува вредноста на qrScale.
// На екранот, QR кодот е прикажан со 50% од неговата оригинална големина (Ако на екранот, текстот
// прикажува дека е 335x335 тогаш QR кодот прикажан на екранот е всушност 165.5x165.5 а големината
// во која што ќе се симне QR кодот е оригиналната односно 335x335)
// За прикажување на 50% од големината се користи атрибут во CSS фајлот (.qrCode-container{transform: scale(0.5)}) и ова може да се промени произволно.
let qrScale = 5; // Стандардна и почетна вредност за размерот на исцртаниот QR код. Може да се промени тука.
let qrBorder = 3; // Стандардна и почетна вредност за размерот на границата на исцртаниот QR код. Ова е белата (може да биде и други бои) граница околу QR кодот. Може да се промени тука.
const canvasMaxHeight = 805; // Максималната висина за canvas елементот на кој ќе се исцрта QR кодот. Целта на ова е за да не дојде до преклопување на исцртаниот QR код со елементите на екранот. Може да се промени тука.
const errCorrLvl = qrcodegen.QrCode.Ecc.MEDIUM; // Error correction level (Ниво за поправка на грешки). Може да се промени тука.
// LOW - QR кодот може да толерира околу 7% погрешни кодни зборови
// MEDIUM - QR кодот може да толерира околу 15% погрешни кодни зборови
// QUARTILE - QR кодот може да толерира околу 25% погрешни кодни зборови
// HIGH - QR кодот може да толерира околу 30% погрешни кодни зборови
// Поголемо ниво значи поголем QR код

// -----------------------------------

// Овие вредности се користат/вметнуваат само за креирање на стрингот/текстот што треба да се претвори во QR код и моментално немаат никаква функционалност во проектот.
// Овие полиња не се пополнуваат од страна на корисникот и можат да се променат само тука.
// Вредностите од тука се доделуваат во објектот од кој што се составува стрингот за QR кодот
const type = 1; // Тип на QR (може да биде и "MKD")
const version = "0100"; // Верзија на спецификациите и стандардите користени во QR кодот (Првите два броеви се главната верзијата, а вторите два борја се под-верзијата). Вредноста е тип стринг затоа што неможе да има водечки нули во javascript односно outputot е друг број освен внесениот доколку има водечки нули.
const characterSet = 2; // Енкодирање на карактери (1 за UTF-8 со латински рестриктирани карактери, 2 за UTF-8 со кирилични карактери).
const trailer = "EPD"; // Недвосмислена ознака/индикатор за крајот на податоците за исплатата (EPD - End Payment Data).

// Поставување на горните полиња (type, version, characterSet, trailer) на екранот (Позицијата и стилот е одредено во функцијата).
appendInfoOnScreen();

// Овој код прави две работи:
// -Доколку полето е селектирано/фокусирано се отстранува css стилот
// за грешно пополнето поле ако полето било означено како грешно
// ("required-active" додава црвена линија околу полето, така да со отстранување на овој стил се враќа нормалниот изглед на полето).
// -Доколку полето е селектирано/фокусирано се ресетираат вредностите за големината на QR кодот и
// променливата firstClickOnPreview која помага при одредување на почетната големина на QR кодот
// (Големината на QR кодот зависи од должината на внесените податоци а qrScale и qrBorder имаат ефект само на размерот)
for (let i = 0; i < listOfFields.length; i++) {
  listOfFields[i].addEventListener("focus", (e) => {
    e.target.classList.remove("required-active");
    qrScale = 5;
    qrBorder = 3;
    firstClickOnPreview = true;
  });
}

// Главните функционалности.
// Се додава функционалност на копчето "Прегледај" при негово кликнување.
btnPreview.addEventListener("click", (e) => {
  e.preventDefault();

  // Доколку е вклучен модалниот екран а таб редоследот е на копчето "Прегледај" тогаш
  // со притиснување на Enter ќе се прикажат повеќе дупликат QR кодови и текст за пополнетите податоци, едно до друго.
  // Оваа линија код го спречува тоа така што ја прекинува функционалноста на копчето доколку модалниот екран е вклучен
  if (modalScreen.classList.contains("display-toggle")) return;

  // Во оваа функција се содржани сите правила за валидност на пополнетите податоци
  validateData();

  // Објект кој ги содржи клуч-вредностите за составување на QR стрингот.
  // Тука може да се променат имињата на клучевите, нивните вредности, и редоследот.
  // Редоследот е според моменталниот стандард за MKQR. Сепак редоследот не е важен и само се подредени според стандардот за почитливост/прегледност.
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

  // Создавање нови променливи кои ги содржат клучевите и вредностите, соодветно во низа, за да може да се состави QR стрингот.
  let keys = Object.keys(fieldsObj); // Низа(Array) од клучевите
  let values = Object.values(fieldsObj); // Низа(Array) од вредностите

  // Поставување на почетна вредност на QR текстот
  qrText = "mkqr://pay?";

  // Составување на стрингот/текстот за QR кодот
  for (let i = 0; i < keys.length; i++) {
    if (i !== keys.length - 1) {
      // Ова е бидејќи трејлерот е ставен на крајот сам по себе, не во формат клуч=вредност(без "=" и "&").
      qrText = qrText + keys[i] + "=" + values[i] + "&";
    } else {
      qrText = qrText + values[i];
    }
  }

  // Замена на празните полиња со "%20".
  // Може да се искористи и функцијата encodeURI(qrText) но така и кириличните карактери ќе се енкодираат.
  qrText = qrText.split(" ").join("%20");

  // Функцијата за генерирање QR код.
  // Исцртување на QR кодот каде на canvas елементот му се додава класата како аргумент.
  drawQrCode("display-block");

  // Составување на SVG стрингот
  let svgImageString = generateSvgString();
  // Претворање на стрингот во URL за да може да се симне QR кодот во SVG формат
  svgUrl = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svgImageString);

  // Поврзување и креирање на елементите кои ќе се прикажат на модалниот екран.
  // Се прикажуваат елементите за преглед на внесените податоци.
  // Елементите кои се прикажуваат се само оние полиња кои се пополнети.
  const labels = document.querySelectorAll("label");
  const inputs = document.querySelectorAll(".input-style, .input-style-select");
  for (let i = 0; i < labels.length; i++) {
    // "Хардкодирано" решение за подредување на насловите на групата на која што припаѓаат елементите.
    // Доколку i е наведената вредност, се вметнува насловот од соодветната група и следните полиња што ќе се прикажат
    // на модалниот екран ќе се тие полиња што припаѓаат на таа група, се до следната бројка во останатите услови.
    // Овие услови секогаш се извршуваат само еднаш без разлика дали има поплнети полиња во таа група или не.
    // Разликата помеѓу едната и другата вредност во условите е бројот на полиња помеѓу едниот наслов и другиот наслов.
    // Доколку се додат нови полиња во html фајлот ова нема да функционира т.е. нема да биде прикажано на
    // модалниот екран онака како што треба и ќе треба соодветно да се променат бројките во насловите.
    //-----------------------------------------------------------------------------------------------------------------
    // Вметнување на насловот за групата "Информација за Доверител (Примач)".
    if (i === 0) {
      const titleCreditor = document.querySelector(".creditor-title-container h2.title");
      const filledDataTitleCreditor = document.createElement("h3");
      filledDataTitleCreditor.classList.add("filled-data-title");
      filledDataTitleCreditor.innerText = titleCreditor.innerText;
      filledData.appendChild(filledDataTitleCreditor);
    }
    // Вметнување на насловот за групата "Информација за Должник (Плаќач)".
    if (i === 9) {
      const titleDebtor = document.querySelector(".debtor-title-container h2.title");
      const filledDataTitleDebtor = document.createElement("h3");
      filledDataTitleDebtor.classList.add("filled-data-title");
      filledDataTitleDebtor.innerText = titleDebtor.innerText;
      filledData.appendChild(filledDataTitleDebtor);
    }
    // Вметнување на насловот за групата "Детали за Наплата".
    if (i === 16) {
      const titlePaymentInfo = document.querySelector(".paymentInfo-title-container h2.title");
      const filledDataTitlePaymentInfo = document.createElement("h3");
      filledDataTitlePaymentInfo.classList.add("filled-data-title");
      filledDataTitlePaymentInfo.innerText = titlePaymentInfo.innerText;
      filledData.appendChild(filledDataTitlePaymentInfo);
    }
    // Вметнување на насловот за групата "Дополнителни Податоци".
    if (i === 27) {
      const titleAdditionalInfo = document.querySelector(".additionalInfo-title-container h2.title");
      const filledDataTitleAdditionalInfo = document.createElement("h3");
      filledDataTitleAdditionalInfo.classList.add("filled-data-title");
      filledDataTitleAdditionalInfo.innerText = titleAdditionalInfo.innerText;
      filledData.appendChild(filledDataTitleAdditionalInfo);
    }

    // Вметнување на имињата на полињата и нивните вредности на модалниот екран за да може корисникот да
    // си ги провери внесените податоци.
    // Доколку корисникот внесол податоци во полето т.е. полето има вредност, на модалниот екран ќе
    // се прикаже името на полето и внесената вредност а доколку нема внесена вредност ништо не се случува.
    if (inputs[i].value) {
      const p = document.createElement("p");
      const spanLabel = document.createElement("span");
      const spanInputValue = document.createElement("span");
      spanLabel.classList.add("span-label-data");
      spanInputValue.classList.add("span-input-data");
      p.classList.add("p-data-style");
      spanLabel.innerText = labels[i].innerText;
      // Овој услов е само затоа што за некои полиња се избира вредност наместо да се пополни и треба на поинаков
      // начин да се земе вредноста од полето.
      if (inputs[i].options) {
        spanInputValue.innerText = inputs[i].options[inputs[i].selectedIndex].innerText;
      } else {
        spanInputValue.innerText = inputs[i].value;
      }
      p.appendChild(spanLabel);
      p.append(": ");
      p.appendChild(spanInputValue);
      filledData.appendChild(p);
    }

    // Доколку групата на полиња нема ниедно пополнето поле, на модалниот екран се додава "-" под насловот на групата.
    // Доколку i е 15, тоа значи дека полињата за должникот се веќе проверени и ако сите се празни се додава "-" на модалниот екран.
    // Доколку i е 27, тоа значи дека полињата за дополнителни податоци се веќе проверени и ако сите се празни се додава "-" на модалниот екран.
    if (
      i === 15 &&
      !document.getElementById("debtorName").value &&
      !document.getElementById("debtorAdressType").value &&
      !document.getElementById("debtorCountry").value &&
      !document.getElementById("debtorTown").value &&
      !document.getElementById("debtorPostalCode").value &&
      !document.getElementById("debtorAdressLine1").value &&
      !document.getElementById("debtorAdressLine2").value
    ) {
      const p = document.createElement("p");
      p.classList.add("p-data-style");
      p.innerText = "-";
      filledData.appendChild(p);
    }
    if (
      i === 27 &&
      !document.getElementById("aInfoPaymentCode").value &&
      !document.getElementById("aInfoPaymentType").value &&
      !document.getElementById("aInfoPP50Program").value &&
      !document.getElementById("aInfoPP50IncomeCode").value &&
      !document.getElementById("aInfoPP50PaymentAccount").value &&
      !document.getElementById("aInfoPP50SingleUserAccount").value
    ) {
      const p = document.createElement("p");
      p.classList.add("p-data-style");
      p.innerText = "-";
      filledData.appendChild(p);
    }
  }

  // Се активира/прикажува модалниот екран на крајот од останатите функции
  modalScreen.classList.add("display-toggle");
  qrScreen.classList.add("display-toggle-flex");

  // Бидејќи на големина помала од 335x335(На екранот кодот е прикажан на 50% од таа големина(165.5x165.5)) потешко е да
  // се прочита QR кодот, не сакаме да се намалува повеќе од тоа. Бидејќи со додавање повеќе податоци во полињата
  // големината на почетниот QR код се зголемува и затоа треба да ја зачуваме таа големина, за кога ќе го намалуваме размерот
  // на QR кодот со копчето за намалување што е на екранот, да не можеме да го намалиме под почетната/основната големина.
  // Со  минимално пополнување на податоци, најмалата почетна големина на QR кодот е 335x335 (со размер на qrScale = 5).
  // Може да го поставиме почетниот qrScale на помала вредност но ќе биде потешко да се прочита QR кодот.
  const canvas = document.querySelector("canvas");
  qrWidthHeight.innerText = canvas.width + "x" + canvas.height;
  if (firstClickOnPreview) canvasDefaultHeight = canvas.height;
  firstClickOnPreview = false;
});

// Копче за зголемување на резолуцијата на QR кодот
btnHigherRes.addEventListener("click", () => {
  qrScale = qrScale + 1;
  refreshQR("display-none"); // На canvas елементот се додава класата display-none при новото цртање на QR кодот
  const canvas = document.querySelector("canvas");
  if (canvas.height > canvasMaxHeight) {
    qrScale = qrScale - 1;
    refreshQR("display-block");
  } else {
    refreshQR("display-block");
  }
});

// Копче за намалување на резолуцијата на QR кодот
btnLowerRes.addEventListener("click", () => {
  const canvas = document.querySelector("canvas");
  if (canvas.height > canvasDefaultHeight) {
    qrScale = qrScale - 1;
    refreshQR("display-block");
  } else {
    return;
  }
});

// Додавање функција на копчињата за симнување на QR кодот
// Копче за симнување на QR кодот како слика во PNG формат
btnPNG.addEventListener("click", () => {
  const imgPNG = document.querySelector("canvas");
  const dataURL = imgPNG.toDataURL("image/png");
  btnPNG.setAttribute("href", dataURL);
  const canvas = document.querySelector("canvas");
  btnPNG.setAttribute("download", "MKQR_" + canvas.width + "x" + canvas.height);
});

// Копче за симнување на QR кодот како слика во JPG формат.
btnJPEG.addEventListener("click", () => {
  const imgJPEG = document.querySelector("canvas");
  const dataURL = imgJPEG.toDataURL("image/jpeg");
  btnJPEG.setAttribute("href", dataURL);
  const canvas = document.querySelector("canvas");
  btnJPEG.setAttribute("download", "MKQR_" + canvas.width + "x" + canvas.height);
});

// Копче за симнување на QR кодот како слика во WEBP формат.
btnWEBP.addEventListener("click", () => {
  const imgWEBP = document.querySelector("canvas");
  const dataURL = imgWEBP.toDataURL("image/webp");
  btnWEBP.setAttribute("href", dataURL);
  const canvas = document.querySelector("canvas");
  btnWEBP.setAttribute("download", "MKQR_" + canvas.width + "x" + canvas.height);
});

// Копче за симнување на QR кодот како слика во SVG формат
btnSVG.addEventListener("click", () => {
  btnSVG.setAttribute("href", svgUrl); // Како линк се додава претходно генерираниот SVG URL стринг од функцијата за копчето "Прегледај".
  btnSVG.setAttribute("download", "MKQR");
});

// Копче за излез од модалниот екран
btnExitModalScreen.addEventListener("click", () => {
  // Испразнување т.е. ресетирање на елементи и променливи.
  qrText = "";
  svgUrl = "";
  modalScreen.classList.remove("display-toggle");
  qrCodeContainer.removeChild(qrCodeContainer.firstChild);
  qrScreen.classList.remove("display-toggle-flex");

  // Бришење на елементите (за преглед на пополнети полиња) од модалниот екран за доколку повторно кликнеме на
  // копчето "Прегледај" да не се дуплираат елементите на екранот
  while (filledData.firstChild) {
    filledData.removeChild(filledData.firstChild);
  }
});

// Додавање функција на select елементот во групата Доверител.
// Кога select елементот (Тип на адреса) ќе се промени во комбинирано, полињата Град и Поштенски код се тргнуваат
// од правилата за валидност такашто им се отстранува атрибутот required и им се додава атрибутот disabled и класата
// lower-opacity со што се оневозможуваат.
// 0 е "Структурирана".
// 1 е "Комбинирана".
creditorSelect.addEventListener("change", () => {
  if (creditorSelect.options.selectedIndex === 1) {
    const townField = document.querySelector(".creditorTownDiv");
    townField.classList.add("lower-opacity");
    const inputTown = document.getElementById("creditorTown");
    inputTown.required = false;
    inputTown.disabled = true;
    inputTown.value = "";

    const creditorAdressLine1 = document.getElementById("creditorAdressLine1");
    const creditorAdressLine2 = document.getElementById("creditorAdressLine2");
    creditorAdressLine1.required = true;
    creditorAdressLine2.required = true;

    const postalCodeField = document.querySelector(".creditorPostalCodeDiv");
    postalCodeField.classList.add("lower-opacity");
    const inputPostalCode = document.getElementById("creditorPostalCode");
    inputPostalCode.required = false;
    inputPostalCode.disabled = true;
    inputPostalCode.value = "";
  } else {
    const townField = document.querySelector(".creditorTownDiv");
    townField.classList.remove("lower-opacity");
    const inputTown = document.getElementById("creditorTown");
    inputTown.required = true;
    inputTown.disabled = false;

    const creditorAdressLine1 = document.getElementById("creditorAdressLine1");
    const creditorAdressLine2 = document.getElementById("creditorAdressLine2");
    creditorAdressLine1.required = false;
    creditorAdressLine2.required = false;

    const postalCodeField = document.querySelector(".creditorPostalCodeDiv");
    postalCodeField.classList.remove("lower-opacity");
    const inputPostalCode = document.getElementById("creditorPostalCode");
    inputPostalCode.required = true;
    inputPostalCode.disabled = false;
  }
});

//----Истите функционалности како за групата Доверител------
// Додавање функција на select елементот во групата Должник (Истите функционалности како за select елементот за групата Доверител)
// Кога select елементот (Тип на адреса) ќе се промени во комбинирано, полињата Град и Поштенски код се тргнуваат
// од правилата за валидност такашто им се отстранува атрибутот required и им се додава атрибутот disabled и класата
// lower-opacity со што се оневозможуваат.
// 0 е "-".
// 1 е "Структурирана".
// 2 е "Комбинирана".
debtorSelect.addEventListener("change", () => {
  if (debtorSelect.options.selectedIndex === 2) {
    const townField = document.querySelector(".debtorTownDiv");
    townField.classList.add("lower-opacity");
    const inputTown = document.getElementById("debtorTown");
    inputTown.required = false;
    inputTown.disabled = true;
    inputTown.value = "";

    const debtorAdressLine1 = document.getElementById("debtorAdressLine1");
    const debtorAdressLine2 = document.getElementById("debtorAdressLine2");
    debtorAdressLine1.required = true;
    debtorAdressLine2.required = true;

    const postalCodeField = document.querySelector(".debtorPostalCodeDiv");
    postalCodeField.classList.add("lower-opacity");
    const inputPostalCode = document.getElementById("debtorPostalCode");
    inputPostalCode.required = false;
    inputPostalCode.disabled = true;
    inputPostalCode.value = "";
  } else {
    const townField = document.querySelector(".debtorTownDiv");
    townField.classList.remove("lower-opacity");
    const inputTown = document.getElementById("debtorTown");
    inputTown.required = true;
    inputTown.disabled = false;

    const debtorAdressLine1 = document.getElementById("debtorAdressLine1");
    const debtorAdressLine2 = document.getElementById("debtorAdressLine2");
    debtorAdressLine1.required = false;
    debtorAdressLine2.required = false;

    const postalCodeField = document.querySelector(".debtorPostalCodeDiv");
    postalCodeField.classList.remove("lower-opacity");
    const inputPostalCode = document.getElementById("debtorPostalCode");
    inputPostalCode.required = true;
    inputPostalCode.disabled = false;
  }
});
// Кога ќе се селектира соодветната опција од полето тип на референца, се менува максималната должина на полето Референца
// 0 за вредност NON
// 1 за вредност QRR
// 2 за вредност SCOR
// Ова е бидејќи за различна опција има различна максимална должина на карактери
referenceType.addEventListener("change", () => {
  if (referenceType.options.selectedIndex === 2) {
    // Ако има внесени карактери со должина поголема од 25 тогаш се бришат/ресетираат внесените податоци за ова поле
    if (document.getElementById("paymentReference").value.length > 25) {
      document.getElementById("paymentReference").value = "";
      document.getElementById("paymentReference").classList.add("required-active");
    }
    document.getElementById("paymentReference").setAttribute("maxlength", 25);
  } else {
    document.getElementById("paymentReference").setAttribute("maxlength", 27);
  }
});

//------------------------------ Функции---------------------------------------------

// Функција за валидација на полињата (моментално проверува дали задолжителните полиња се празни
// и дали има празни места на почетокот и крајот од внесените податоци)
function validateData() {
  let fieldsMissingValue = false;
  let fieldsHaveWhiteSpace = false;
  let messageMissingValue = "На едно или повеќе задолжителни полиња им недостасува вредност!";
  let messageWhiteSpaceValue = "На едно или повеќе полиња има празно место на почетокот или на крајот од внесените податоци";

  // Ако било кое од полињата во групата "Должник" се пополнети тогаш на останатите задолжителни полиња , според MKQR
  // стандардот, им се доделува атрибутот required со чија помош се врши валидација на полињата.
  if (
    document.getElementById("debtorName").value ||
    document.getElementById("debtorAdressType").value ||
    document.getElementById("debtorCountry").value ||
    document.getElementById("debtorTown").value ||
    document.getElementById("debtorPostalCode").value
    // document.getElementById("debtorAdressLine1").value
    // document.getElementById("debtorAdressLine2").value
  ) {
    document.getElementById("debtorName").required = true;
    document.getElementById("debtorAdressType").required = true;
    document.getElementById("debtorCountry").required = true;
    document.getElementById("debtorTown").required = true;
    document.getElementById("debtorPostalCode").required = true;
    // document.getElementById("debtorAdressLine1").required = true;
    // document.getElementById("debtorAdressLine2").required = true;
  } else {
    document.getElementById("debtorName").required = false;
    document.getElementById("debtorAdressType").required = false;
    document.getElementById("debtorCountry").required = false;
    document.getElementById("debtorTown").required = false;
    document.getElementById("debtorPostalCode").required = false;
    // document.getElementById("debtorAdressLine1").required = false;
    // document.getElementById("debtorAdressLine2").required = false;
  }

  if (
    document.getElementById("aInfoPaymentCode").value ||
    document.getElementById("aInfoPaymentType").value ||
    document.getElementById("aInfoPP50Program").value ||
    document.getElementById("aInfoPP50IncomeCode").value ||
    document.getElementById("aInfoPP50PaymentAccount").value ||
    document.getElementById("aInfoPP50SingleUserAccount").value
  ) {
    document.getElementById("aInfoPaymentCode").required = true;
    document.getElementById("aInfoPP50Program").required = true;
    document.getElementById("aInfoPP50IncomeCode").required = true;
  } else {
    document.getElementById("aInfoPaymentCode").required = false;
    document.getElementById("aInfoPP50Program").required = false;
    document.getElementById("aInfoPP50IncomeCode").required = false;
  }

  if (document.getElementById("paymentType").options.selectedIndex === 1) {
    document.getElementById("paymentReference").required = true;
  } else {
    document.getElementById("paymentReference").required = false;
  }

  for (i = 0; i < listOfFields.length; i++) {
    // Правила за полиња каде е задолжителен внес на податоци.
    if (listOfFields[i].validity.valueMissing) {
      fieldsMissingValue = true;
      listOfFields[i].classList.add("required-active");
    }
    if (listOfFields[i].required === false && listOfFields[i].classList.contains("required-active")) {
      listOfFields[i].classList.remove("required-active");
    }
    // Правила за празно место во внесените податоци (Пред и после внесените податоци)
    if (listOfFields[i].value.startsWith(" ") || listOfFields[i].value.endsWith(" ")) {
      listOfFields[i].classList.add("required-active");
      fieldsHaveWhiteSpace = true;
    }
  }
  if (fieldsMissingValue) throw alert(messageMissingValue); // Тука се прекинува процесот доколку овој услов е исполнет. Остатокот од кодот не се извршува.
  if (fieldsHaveWhiteSpace) throw alert(messageWhiteSpaceValue); // Тука се прекинува процесот доколку овој услов е исполнет. Остатокот од кодот не се извршува.
}

// Функција за одново исцртување на QR кодот на екран и ажурирање на текстот на екранот кој ја
// прикажува ширината и висината на QR кодот.
function refreshQR(className) {
  qrCodeContainer.removeChild(qrCodeContainer.firstChild);
  drawQrCode(className);
  const canvas = document.querySelector("canvas");
  qrWidthHeight.innerText = canvas.width + "x" + canvas.height;
}

// Функција за исцртување на QR кодот на екран
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

// Функција за креирање на canvas елемент на кој што ќе се исцрта QR кодот.
// className параметарот е за да може да додаваме стилови на canvasot како display-none, display-block итн.
// за поголема флексибилност и контрола
function appendCanvas(className) {
  let result = document.createElement("canvas");
  result.classList.add(className);
  qrCodeContainer.appendChild(result);
  return result;
}

// Функција за поедноставување и почитливост при генерирање QR код кој ја користи функцијата toSvgString()
function drawQrCode(className) {
  const qrCode = qrcodegen.QrCode.encodeText(qrText, errCorrLvl);
  drawCanvas(qrCode, qrScale, qrBorder, "#FFFFFF", "#000000", appendCanvas(className));
}

// Функција за поедноставување и почитливост при генерирање SVG стринг кој ја користи функцијата toSvgString()
function generateSvgString() {
  const qrCode = qrcodegen.QrCode.encodeText(qrText, errCorrLvl);
  return toSvgString(qrCode, qrBorder, "#FFFFFF", "#000000");
}

// Функција за генерирање на SVG стринг за да може генерираниот QR код да се симне во SVG формат
// Генерираниот SVG стринг се додава во линк за симнување
// Оваа функција е copy-paste од примерите од библиотеката за генерирање QR код
function toSvgString(qr, border, lightColor, darkColor) {
  if (border < 0) throw "Border must be non-negative";
  let parts = [];
  for (let y = 0; y < qr.size; y++) {
    for (let x = 0; x < qr.size; x++) {
      if (qr.getModule(x, y)) parts.push(`M${x + border},${y + border}h1v1h-1z`);
    }
  }
  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
<svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 ${qr.size + border * 2} ${qr.size + border * 2}" stroke="none">
<rect width="100%" height="100%" fill="${lightColor}"/>
<path d="${parts.join(" ")}" fill="${darkColor}"/>
</svg>
`;
}

// Оваа функција додава/прикажува текстуални информации на екранот/формата како:
// QR Тип, Верзија на стандардот, Тип на енкодирање на карактери, и трејлер текстот кој се додава на крајот од QR стрингот.
// Во случајов елементите се лоцирани под копчето "Прегледај".
function appendInfoOnScreen() {
  // Креирање елементи за "QR Тип"
  const typeSpan = document.createElement("span");
  const typeValueSpan = document.createElement("span");
  typeSpan.innerText = "QR Тип";
  typeSpan.classList.add("bold");
  typeValueSpan.innerText = type;

  // Креирање елементи за "Верзија на стандарот"
  const versionSpan = document.createElement("span");
  const versionValueSpan = document.createElement("span");
  versionSpan.innerText = "Верзија";
  versionSpan.classList.add("bold");
  versionValueSpan.innerText = version;

  // Креирање елементи за "Енкодирање на карактери"
  const characterSetSpan = document.createElement("span");
  const characterSetValueSpan = document.createElement("span");
  characterSetSpan.innerText = "Енкодирање карактери";
  characterSetSpan.classList.add("bold");
  characterSetValueSpan.innerText = characterSet;

  // Креирање елементи за "Трејлер текстот"
  const trailerSpan = document.createElement("span");
  const trailerValueSpan = document.createElement("span");
  trailerSpan.innerText = "Трејлер";
  trailerSpan.classList.add("bold");
  trailerValueSpan.innerText = trailer;

  // Подредување и завиткување/енкапсулирање на креираните елементи во сопствени div елементи
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

  // Креирање на "главен" div елемент за завиткување/енкапсулирање на погоре креираните div елементи
  const wrapDivAll = document.createElement("div");
  wrapDivAll.classList.add("stats-style");

  // Додавање на сите div-ови во главниот div елемент
  wrapDivAll.appendChild(wrapDiv1);
  wrapDivAll.appendChild(wrapDiv2);
  wrapDivAll.appendChild(wrapDiv3);
  wrapDivAll.appendChild(wrapDiv4);

  // Додавање на главниот div во некој елемент на екранот (Во случајов на btnContainer елементот)
  // Вака елементите ќе се прикажат под копчето "Прегледај"
  btnContainer.appendChild(wrapDivAll);
}
