import util from "./util";
import * as Print from "expo-print";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { Alert } from "react-native";
import { appColor } from "../theme/appColor";
import moment from "moment";
import { Constants, DateFormat } from "./Constants";
import { companyLogo, squareJHA, triangleJHA } from "./base64Images";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Image } from "react-native";

export function getImageSizeAsync(imageUrl) {
  return new Promise((resolve, reject) => {
    if (typeof imageUrl !== 'string' || !imageUrl.startsWith('http')) {
      const err = new Error('Invalid image URL');
      console.error(err.message, imageUrl);
      return reject(err);
    }

    Image.getSize(
      imageUrl,
      (width, height) => {
        if (typeof width === 'number' && typeof height === 'number') {
          console.log('Image size:', width, height);
          resolve({ width, height });
        } else {
          const err = new Error('Image.getSize returned invalid dimensions');
          console.error(err.message);
          reject(err);
        }
      },
      (error) => {
        console.error('Error getting image size:', error.message || error);
        reject(new Error('Failed to load image size from URL'));
      }
    );
  });
}

export const dailyEntryPdf = async (data) => {
  const { signature, selectedLogo, userId, projectId, selectedDate, location, onShore, weather, workingDay, reportNumber, projectNumber, projectName, owner, contractNumber, contractor, siteInspector, timeIn, timeOut, ownerContact, ownerProjectManager, component, equipments, labours, visitors, description, tempHigh, tempLow,declForm } = data;
  const width = 150
  const height = 150

  console.log("declrationForm : ",JSON.stringify(declForm));

  let equipmentHtml = '';
  if (equipments && equipments.length > 0) {
    for (let item of equipments) {
      console.log("item : ", item);
      const { equipmentName, quantity, hours, totalHours } = item;
      equipmentHtml += `
             <div class="section-inner">
                <p><span class="bold">Equipment Name:</span> <span class="value-text">${equipmentName}</span></p>
                <p><span class="bold">Quantity:</span> <span class="value-text">${quantity}</span></p>
                <p><span class="bold">Hours:</span> <span class="value-text">${hours}</span></p>
                <p><span class="bold">Total Hours:</span> <span class="value-text">${totalHours}</span></p>
            </div>
            `;
    }
  }
  let labourHtml = '';
  if (labours && labours.length > 0) {
    for (let item of labours) {
      labourHtml += `
                        <p><span class="bold">Contractor Name:</span> <span class="value-text">${item.contractorName}</span></p>
            `
      for (let role of item.roles) {
        const { roleName, quantity, hours, totalHours } = role;
        labourHtml += `
                <div class="section-inner">
                    <p><span class="bold">Role:</span> <span class="value-text">${roleName}</span></p>
                    <p><span class="bold">Quantity:</span> <span class="value-text">${quantity}</span></p>
                    <p><span class="bold">Hours:</span> <span class="value-text">${hours}</span></p>
                    <p><span class="bold">Total Hours:</span> <span class="value-text">${totalHours}</span></p>
                </div>
                `
      }
    }
  }
  let visitorHtml = '';
  if (visitors && visitors.length > 0) {
    for (let item of visitors) {
      visitorHtml += `
             <div class="section-inner">
                <p><span class="bold">Visitor Name:</span> <span class="value-text">${item.visitorName || "Unknown Visitor"}</span></p>
                <p><span class="bold">Company:</span> <span class="value-text">${item.company || "Unknown Company"}</span></p>
                <p><span class="bold">Quantity:</span> <span class="value-text">${item.quantity || "0"}</span></p>
                <p><span class="bold">Hours:</span> <span class="value-text">${item.hours || "0"}</span></p>
                <p><span class="bold">Total Hours:</span> <span class="value-text">${item.totalHours || "0"}</span></p>
            </div>
            `
    }
  }

  let signatureHtml = "";
  if (signature) {
    signatureHtml = `
      <img src="${signature}" alt="Signature" style="width: 50px; margin-left: 60px;" />
      `
  }
  let decFormHtml = "";

  if(declForm){
   declForm.map((item) => {
     decFormHtml +=` <tr><th colspan="1" class="section-header">${item.title}</th><th style="width: 40%; text-align: center;">Action/Notes</th></tr>`;
     item.list.map((_item, index) => {
       decFormHtml += `<tr><td>${_item?.key} </td><td style="width: 40%; text-align: center;" >${_item?.value}</td></tr>`;
     })

   })
  }

  try {
    // const image = await util.convertImageToBase64();
    const htmlContent = `<!DOCTYPE html>
<html>
<head>
    <title>Inspection Report</title>
    <style>
        p{
            margin: 5px;
            padding: 0;
        }
        body {
            font-family: Arial, sans-serif;
            margin: 20px;
            padding: 20px;
        }
        .container {
            width: 100%;
            padding: 10px;
        }
        .section {
            border: 1px solid #333;
            padding: 10px;
            margin-bottom: 15px;
            background-color: #ffffff;
        }
        .section-inner {
            border: 1px solid #c7c7c7;
            padding: 0px 10px;
            margin-bottom: 5px;
            background-color: #ffffff;
        }
        .header {
              text-align: center;
                      font-size: 24px;
                      font-weight: bold;
                      background-color:${appColor.primary};
                      color: white;
                      padding: 10px;
                      border-radius: 5px;
                      margin-bottom:10px;
        }
        .info-table {
            width: 100%;
            border-collapse: collapse;
        }
        .info-table td, .info-table th {
            border: 0.5px solid #333;
            padding: 3px 10px;
            text-align: left;
        }
        .bold {
            font-weight:bolder;
            color: 'black';
            font-size: small;
        } 
        .logo {
        height: 80px;
      }
      .side-logo{
         height: ${height}px;
      }
       .heading {
        font-weight: bold;
        color: #486ecd;
      }
        .visitor-table{
            display:flex;
            flex-direction: row;
        }
             .value-text {
        color: #333;
        font-size: 14px;
         width: 100px;
      }

        table {
      width: 100%;
      border-collapse: collapse;
    }

    th, td {
      border: 1px solid #ccc;
      padding: 10px;
      vertical-align: top;
      font-size: 10px;
    }

    th {
      background-color: #f4f4f4;
      text-align: left;
      font-size: 10px;
    }

    .section-header {
      background-color: #e0e0e0;
      font-weight: bold;
      text-align: left;
      padding: 10px;
      border: 1px solid #ccc;
      colspan: 2;
    }
 .img-container{
        width: 100%;
        padding: 10px;
        display: flex;
        flex-direction: row;
        justify-content: space-between;
      }
        .header-title {
      font-size: 35px;
    }
    </style>
</head>
<body>
    <div class="container">
    <div class="img-container">
      <img
        src="${companyLogo}"
        alt="Company Logo"
        class="logo"
      />
      <div class="header-title">Daily Report</div>

       <img
        src="${selectedLogo?.file_url}"
        alt="Company Logo"
        class="side-logo"
        
      />
    </div>
        <div class="section">
 
            <table class="info-table">
                <tr><td class="bold">⁠Project Name :</td><td class="value-text">${projectName || 'N/A'}</td><td class="bold">⁠Project Number :</td><td class="value-text">${projectNumber || 'N/A'}</td></tr>
                <tr><td class="bold">⁠Owner :</td><td class="value-text">${owner || 'N/A'}</td><td class="bold">⁠Owner Contact :</td><td class="value-text">${ownerContact || 'N/A'}</td></tr>
                <tr><td class="bold">⁠Contractor :</td><td class="value-text">${contractor || 'N/A'}</td><td class="bold">⁠Contract Number :</td><td class="value-text">${contractNumber || 'N/A'}</td></tr>
                <tr><td class="bold">Date :</td><td class="value-text">${selectedDate || 'N/A'}</td><td class="bold">⁠Working Day :</td><td class="value-text">${workingDay || 'N/A'}</td></tr>
                <tr><td class="bold">Location :</td><td class="value-text">${location || 'N/A'}</td><td class="bold">⁠Weather Conditions :</td><td class="value-text">${weather || 'N/A'}</td></tr>
                <tr><td class="bold">⁠Temp. High/Low :</td><td class="value-text">${tempHigh || 'N/A'} / ${tempLow || 'N/A'}</td><td class="bold">⁠Onshore/Offshore :</td><td class="value-text">${onShore || 'N/A'}</td></tr>
                <tr><td class="bold">⁠Site Inspector :</td><td class="value-text">${siteInspector || 'N/A'} </td><td class="bold">⁠Inspector In/Out Time :</td><td class="value-text">${timeIn || 'N/A'} / ${timeOut || 'N/A'}</td></tr>
                <tr><td class="bold">⁠Report Number :</td><td class="value-text">${reportNumber || 'N/A'}</td><td class="bold">Owner Project Manager :</td><td class="value-text">${ownerProjectManager || 'N/A'}</td></tr>
                <tr><td class="bold">⁠Component :</td><td class="value-text">${component || 'N/A'}</td><td class="bold"></td><td class="bold"></td></tr>
            </table>
        </div>

        <div class="section">
            <p><span class="heading">Equipment Details</span></p>
           ${equipmentHtml}
        </div>

        
        <div class="section">
            <p><span class="heading">Labour Details</span></p>
            ${labourHtml}
        </div>

        <div class="section">
            <p><span class="heading">Visitor Details</span></p>
            ${visitorHtml}
        </div>

        <div class="section">
        <p><span class="heading">Description of Work</span></p>
        <div class="section-inner">
          <p>
            <span class="value-text"
              >${description}</span
            >
          </p>
        </div>
      </div>
    </div>


    <table>

 ${ decFormHtml}
</table>

<div style="display: flex; flex-direction: row; width: 100%; border: 1px solid #ccc; margin-top: 40px;">

  <div style="display: flex; flex-direction: row;width: 50%; height: 100px; padding: 10px;">
    <p>Report Done By: </p>
${signatureHtml}

  </div>

  <div style="height: 150px; width: 1px; background-color: #ccc;">

  </div>

  <div style="width: 50%;height: 150px; padding: 10px;">
    <span>Region Representative:</span>
    
  </div>

</div>
</body>
</html>`;
    console.log("htmlContent :", htmlContent)



    try {
      // Generate the PDF
      const REPORTS_FOLDER = FileSystem.documentDirectory + "Reports/";
      const folderExists = await FileSystem.getInfoAsync(REPORTS_FOLDER);
      if (!folderExists.exists) {
        await FileSystem.makeDirectoryAsync(REPORTS_FOLDER, { intermediates: true });
      }
      const { uri } = await Print.printToFileAsync({ html: htmlContent,width:1000 });
      const fileUri = REPORTS_FOLDER + "DailyReport.pdf";

      // Move file to a readable location
      await FileSystem.moveAsync({ from: uri, to: fileUri });

      // Share the generated PDF file
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri);
      }
    } catch (error) {
      Alert.alert("Error", error.message);
      return false;
    }
  } catch (error) {
    console.log("Error : ", error);
    Alert.alert("Error", 'Something went wrong. Please try again.');
    return false;
  }
}


export const createWeeklyPdf = async (weeklyReport) => {

  // console.log("weeklyReport : ", JSON.stringify(weeklyReport));
  try {

    const {
      signature,
      cityProjectManager,
      consultantProjectManager,
      contractAdministrator,
      contractNumber,
      contractProjectManager,
      contractorSiteSupervisorOffshore,
      contractorSiteSupervisorOnshore,
      dailyDiaries,
      dailyEntries,
      endDate,
      owner,
      projectId,
      projectName,
      projectNumber,
      reportDate,
      siteInspector,
      inspectorTimeOut,
      inspectorTimeIn,
      startDate,
      supportCA,
      userId,
      logo,
      ImageSelection,
      selectedLogo
    } = weeklyReport;

    const imageUrl = selectedLogo?.file_url;
    // const { width, height } = await getImageSizeAsync(imageUrl);
    const width = 150
    const height = 150
    

    
    const discriptionMap = [];
    const equipmentsMap = new Map();
    const laboursMap = new Map();
    const visitorsMap = new Map();
    let location = '';
    let ownerProjectManager = '';
    const temprature = new Map();

    // console.log("ImageSelection :",JSON.stringify(ImageSelection))
    dailyDiaries.forEach((item) => {
      const date = item.selectedDate;
      const formattedDate = moment.utc(date).format('dddd, MMMM Do, YYYY');
      discriptionMap.push({ date: formattedDate, description: item.description });
    });
    dailyEntries.forEach((item) => {
      const date = item.selectedDate;
      const formattedDate = moment.utc(date).format('dddd, MMMM Do, YYYY');
      discriptionMap.push({ date: formattedDate, description: item.description });
    });

    dailyEntries?.forEach((item, index) => {
      location = item?.location;
      ownerProjectManager = item?.ownerProjectManager
      temprature.set(item.selectedDate, { date: item.selectedDate, tempLow: item.tempLow, tempHigh: item.tempHigh, weather: item.weather });
      const equipments = item?.equipments;
      if (equipments?.length > 0) {
        equipments?.forEach((equipment) => {
          if (equipmentsMap.has(equipment.equipmentName)) {
            const existingEquipment = equipmentsMap.get(equipment.equipmentName);
            existingEquipment.number = Number(existingEquipment.number) + Number(equipment.quantity);
            existingEquipment.days = Number(existingEquipment.days) + 1;
            existingEquipment.hours = Number(existingEquipment.hours) + Number(equipment.hours);
            equipmentsMap.set(equipment.equipmentName, existingEquipment);
          } else {
            equipmentsMap.set(equipment.equipmentName, {
              number: equipment.quantity,
              days: 1,
              hours: equipment.hours,
              name: equipment.equipmentName
            });
          }
        });
      }
      const labours = item?.labours;
      if (labours?.length > 0) {
        labours?.forEach((labour) => {
          if (laboursMap.has(labour.contractorName)) {
            const existingLabour = laboursMap.get(labour.contractorName);
            existingLabour.push(...labour.roles)
            laboursMap.set(labour.contractorName, existingLabour);
          } else {
            laboursMap.set(labour.contractorName, labour.roles);
          }
        });
      }
      const visitors = item?.visitors;
      if (visitors?.length > 0) {
        visitors?.forEach((visitor) => {
          if (visitorsMap.has(visitor.visitorName)) {
            let existingVisitor = visitorsMap.get(visitor.visitorName);
            existingVisitor.hours = Number(existingVisitor.hours) + Number(visitor.hours);
            existingVisitor.quantity = Number(existingVisitor.quantity) + Number(visitor.quantity);
            existingVisitor["days"] = Number(existingVisitor.days) + 1;
            visitorsMap.set(visitor.visitorName, existingVisitor);
          } else {
            visitor["days"] = 1;
            visitorsMap.set(visitor.visitorName, visitor);
          }
        });

      }

    });



    let descriptionHtml = ``;
    discriptionMap?.sort((a, b) => moment(a.date, 'dddd, MMMM Do, YYYY').toDate() - moment(b.date, 'dddd, MMMM Do, YYYY').toDate());
    discriptionMap?.forEach((item) => {
      descriptionHtml += `<h5 class="heading-title">${item?.date || 'N/A'}</h5>
          </h5>

          <h6>Description of work: </h6>
          <p style="font-size: 10px;">${item?.description || 'N/A'}</p>`;
    })

    let equipmentHtml = `<h5>
          Equipments
          </h5>`;
    Array.from(equipmentsMap?.values()).forEach((item) => {
      equipmentHtml += `
        <div style="display: flex;flex-direction: row; width: 250px;">
          <p style="width: 50px; font-size: 14px;"> ${item.number || 'N/A'} - </p>
          <p style="width: 250px; font-size: 14px;">${item.name || 'N/A'}  </p>
          <p style=" padding-left: 10px; width: 30px; font-size: 14px;">${item.days || 'N/A'}</p>
        </div>`
    })

    let labourHtml = `
    <h5>
          Labours
          </h5>
    `
    Array.from(laboursMap?.values()).flat().forEach((item) => {
      labourHtml += `
        <div style="display: flex;flex-direction: row; width: 250px;">
          <p style="width: 50px; font-size: 14px;"> ${item.quantity || 'N/A'} - </p>
          <p style="width: 250px; font-size: 14px;">${item.roleName || 'N/A'}  </p>
          <p style=" padding-left: 10px; width: 30px; font-size: 14px;">${'1'}</p>
        </div>`
    })

    let visitorsHtml = `
     <h5>
          Visitors
          </h5>
    `
    Array.from(visitorsMap?.values()).forEach((item) => {
      visitorsHtml += `
       <div style="display: flex;flex-direction: row; width: 250px;">
          <p style="width: 50px; font-size: 14px;"> ${item.quantity || 'N/A'} - </p>
          <p style="width: 250px; font-size: 14px;">${item.visitorName || 'N/A'} - ${item.company || 'N/A'}  </p>
          <p style=" padding-left: 10px; width: 30px; font-size: 14px;">${item.days || 'N/A'}</p>
        </div>
      `
    })

    let weatherHtml = ``
    const temps = Array.from(temprature?.values()).sort((a, b) => new Date(b.date) - new Date(a.date));

    temps?.forEach((item) => {
      weatherHtml += `
       <tr  style="text-align: center;">
            <td>${moment(item.date).format('MMMM DD, YYYY')}</td>
            <td>${item?.tempLow || 'N/A'}</td>
            <td>${item?.tempHigh || 'N/A'}</td>
            <td>${item?.weather || 'N/A'}</td>
          </tr>
      `
    })

    let imageHtml = ``

    // console.log("ImageSelection : ",JSON.stringify(ImageSelection));
    ImageSelection?.map((item) => {
      // imageHtml += `   <h5>Location : ${item?.location || 'N/A'}</h5>`;
      // imageHtml += `<h5 class="heading-title">Date : ${item?.date || 'N/A'}</h5>`;
      item?.images?.map((image) => {

        imageHtml += `
        <div class="border" style="display:flex;  width:100%; justify-content: center; align-items: center;  padding: 10px 0px;">
        <img width="100px" height="150px"  src=${image?.uri} style="margin-top: 10px; " />

        </div>
        </hr>

        `;
      })
    })

    // console.log("equipmentsMap : ", Array.from(equipmentsMap.values()));
    // console.log("laboursMap : ", JSON.stringify(Array.from(laboursMap.values())));
    // console.log("visitorsMap : ", JSON.stringify(Array.from(visitorsMap.values())));
    // console.log("temprature : ", JSON.stringify(Array.from(temprature.values())));


    let signatureHtml = "";
    if (signature) {
      signatureHtml = `
      <img src="${signature}" alt="Signature" style="width: 50px; margin-left: 60px;" />
      `
    }

    const htmlContent = `<!DOCTYPE html>
<html>
  <head>
    <title>Inspection Report</title>
    <style>
        p {
        margin: 5px;
        padding: 0;
      }
      body {
        font-family: Arial, sans-serif;
        margin: 20px;
        padding: 20px;
      }
      .container {
        width: 100%;
        padding: 10px;
      }
        .img-container{
        width: 100%;
        padding: 10px;
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
      }
      .section {
        border: 1px solid #333;
        padding: 10px;
        margin-bottom: 15px;
        background-color: #ffffff;
      }
      .section-inner {
        border: 1px solid #c7c7c7;
        padding: 0px 10px;
        margin-bottom: 5px;
        background-color: #ffffff;
      }
      .header-title {
        text-align: center;
        font-size: 24px;
        font-weight: bold;
        background-color: "red";
        border-radius: 5px;
      }
      .info-table {
        width: 100%;
        border-collapse: collapse;
      }
      .info-table td,
      .info-table th {
        border: 0.5px solid #333;
        padding: 3px 10px;
        text-align: left;
      }
      .bold {
        font-weight: bolder;
        color: "black";
        font-size: small;
      }
     .logo {
        height: 50px;
      }
      .side-logo{
        
        height: ${height}px;
      }
      .heading {
        font-weight: bold;
        color: #486ecd;
      }
      .visitor-table {
        display: flex;
        flex-direction: row;
      }
      .value-text {
        color: #333;
        font-size: 14px;
      }
      .header{
        font-size: 12px;
      }
      .header-value{
        font-size: 12px;
      }
      .table-heading{
        font-size: 14px;
        font-weight: bold;
        color: #486ecd;
      }
      .border{
        border: 0.5px solid #333;
      }
      .main-div{
        display: flex;
        flex-direction: row;
        width: 100%;
      }
      .div-0{
        width: 600px;
      }
     
      .div-1{
        width: 250px;
        padding: 10px;
      }
      .div-2{
        width: 50px;
      }
      .div-3{
        width: 480px;
      }
      .div-4{
        width: 280px;
      }
      .heading-title{
        color: #486ecd;
      }
      p,h1,h2,h3,h4,h5,h6{
        margin: 2px;
        padding: 2px;
      }

      
    </style>
  </head>
  <body>
    <div class="img-container">
      <img
        src="${companyLogo}"
        alt="Company Logo"
        class="logo"
      />
      <div class="header-title">Weekly Report</div>

       <img
        src="${selectedLogo.file_url}"
        alt="Company Logo"
        class="side-logo"
      />
    </div>

    <div class="section">
      <table class="info-table">
          <tr><td class="bold">⁠Project Name :</td><td class="value-text">${projectName || 'N/A'}</td><td class="bold">⁠Project Number :</td><td class="value-text">${projectNumber || 'N/A'}</td></tr>
          <tr><td class="bold">Report Date :</td><td class="value-text">${reportDate || 'N/A'}</td><td class="bold">Consultant Project Manager :</td><td class="value-text">${consultantProjectManager || 'N/A'}</td></tr>
          <tr><td class="bold">⁠Owner :</td><td class="value-text">${owner || 'N/A'}</td><td class="bold">City Project Manager :</td><td class="value-text">${cityProjectManager || 'N/A'}</td></tr>
          <tr><td class="bold">Contract Project Manager :</td><td class="value-text">${contractProjectManager || 'N/A'}</td><td class="bold">⁠Contract Number :</td><td class="value-text">${contractNumber || 'N/A'}</td></tr>
          <tr><td class="bold">Start Date :</td><td class="value-text">${startDate || 'N/A'}</td><td class="bold">End Date :</td><td class="value-text">${endDate || 'N/A'}</td></tr>
          <tr><td class="bold">Owner Project Manager :</td><td class="value-text">${ownerProjectManager || 'N/A'}</td><td class="bold">Location :</td><td class="value-text">${location || 'N/A'}</td></tr>
          <tr><td class="bold">Contractor Site Supervisor Onshore :</td><td class="value-text">${contractorSiteSupervisorOnshore || 'N/A'}</td><td class="bold">Contractor Site Supervisor Offshore :</td><td class="value-text">${contractorSiteSupervisorOffshore || 'N/A'}</td></tr>
          <tr><td class="bold">⁠Site Inspector :</td><td class="value-text">${siteInspector.join(',') || 'N/A'}</td><td class="bold">⁠Inspector In/Out Time :</td><td class="value-text">${inspectorTimeIn || 'N/A'} / ${inspectorTimeOut || 'N/A'}</td></tr>
          <tr><td class="bold">Contract Administrator :</td><td class="value-text">${contractAdministrator || 'N/A'}</td><td class="bold">CA Support :</td><td class="value-text">${supportCA || 'N/A'}</td></tr>

      </table>
  </div>

  <div>
    <div class="table-heading">Weekly Site Report </div>

    <div class="main-div">
      <div class="border div-0">

        <h6>
          Works completed on the week ending ${endDate}
          </h6>
          ${descriptionHtml}
      </div>
      <div class="border div-1">
        <div style="display: flex;flex-direction: row; width: 250px;">
          <p style="width: 50px; font-size: 14px;">Number</p>
          <p style="width: 250px; font-size: 14px;"></p>
          <p style=" padding-left: 10px; width: 30px; font-size: 14px;">Days</p>
        </div>
        ${equipmentHtml}
        ${labourHtml}
        ${visitorsHtml}
        
      </div>


      <div class="border div-3">
      ${imageHtml}
      </div>
    </div>
  </div>


   

     <!--  <div>
    <h4 class="heading-title">Weathers Report</h4>

    <div> <table style="width: 100%;" border="1" cellspacing="0" cellpadding="8">
        <thead>
          <tr>
            <th>Date</th>
            <th>Temperature Low</th>
            <th>Temperature High</th>
            <th>Weather</th>
          </tr>
        </thead>
        <tbody>
        ${weatherHtml} 
        </tbody>
      </table> -->

    </div>

  </div>

  <div style="display: flex; flex-direction: row; width: 100%; border: 1px solid #ccc; margin-top: 40px;">

  <div style="display: flex; flex-direction: row;width: 50%; height: 100px; padding: 10px;">
    <p>Report Done By: </p>
${signatureHtml}

  </div>

  <div style="height: 150px; width: 1px; background-color: #ccc;">

  </div>

  <div style="width: 50%;height: 150px; padding: 10px;">
    <span>Region Representative:</span>
    
  </div>

</div>
   
   
  </body>
</html>`;


    // console.log('htmlContent : ',htmlContent)
    try {
      // Generate the PDF
      const REPORTS_FOLDER = FileSystem.documentDirectory + "Reports/";
      const folderExists = await FileSystem.getInfoAsync(REPORTS_FOLDER);
      if (!folderExists.exists) {
        await FileSystem.makeDirectoryAsync(REPORTS_FOLDER, { intermediates: true });
      }
      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      const fileUri = REPORTS_FOLDER + "WeeklyReport.pdf";

      // Move file to a readable location
      await FileSystem.moveAsync({ from: uri, to: fileUri });

      // Share the generated PDF file
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri);
      }
    } catch (error) {
      Alert.alert("Error", error.message);
    }

  }
  catch (error) {
    console.log("Error : ", error);
  }
}


export const createFolderIfNotExists = async (folderUri) => {
  const folderInfo = await FileSystem.getInfoAsync(folderUri);
  if (!folderInfo.exists) {
    await FileSystem.makeDirectoryAsync(folderUri, { intermediates: true });
  }
};

const savePdf = async (htmlContent, fileName) => {
  try {
    const { uri } = await Print.printToFileAsync(htmlContent);


    const folderUri = FileSystem.documentDirectory + "Reports/";
    await createFolderIfNotExists(folderUri);

    const newPath = folderUri + `${fileName}.pdf`;
    await FileSystem.moveAsync({
      from: uri,
      to: newPath,
    });
    console.log("Saved to:", newPath);
    return true
  } catch (error) {
    return false
  }
};


export const createJHAHarardPdf = async (JobHazardEntryReport) => {
  const {
    reviewedBy, checkedItems, dateReviewed, description, location, otherText, projectName, selectedDate,
    signature, siteOrientationChecked, tasks, time, toolBoxMeetingChecked, workerName
  } = JobHazardEntryReport




  let harardSelectionHtml = `
   `
  if (checkedItems.length > 0) {
    let headerHtml = ``
    checkedItems?.map((item, index) => {
      headerHtml+= `<th>${item?.category || 'N/A'}</th>`
    })
    harardSelectionHtml += ` <table>
    <thead>
      <tr>
      ${headerHtml}
      </tr>
    </thead>
    <tbody>`
harardSelectionHtml += `<tr> `
        checkedItems?.map((item, index) => {

          harardSelectionHtml += `<td>`
          harardSelectionHtml += `<ul>`
          item?.items?.map((text, index) => {
            if(text !== 'Other'){
            harardSelectionHtml += ` <li>${text || 'N/A'}</li> `
            }
          })
          if(otherText[item?.category]){
          harardSelectionHtml += `<li> Other : ${otherText[item?.category]}</li>`
          }
          harardSelectionHtml += `</ul>`
          harardSelectionHtml += `</td>`
        })

        harardSelectionHtml += `</tr></tbody>
  </table>`
  }




  let taskRowHtml = ``;
  if(tasks.length > 0 ){
    taskRowHtml += ` <table>
    <thead>
      <tr>
        <th>TASK #</th>
        <th>TASKS</th>
        <th>H/M/L</th>
        <th>HAZARDS</th>
        <th>PLANS TO ELIMINATE/CONTROL</th>
      </tr>
    </thead>
    <tbody>`
    tasks.map((item, index) => {

      taskRowHtml += `<tr>
        <td>${index+1}</td>
        <td>${item?.task || 'N/A'}</td>
        <td>${item?.severity || 'N/A'}</td>
        <td>${item?.hazard || 'N/A'}</td>
        <td>${item?.controlPlan || 'N/A'}</td>
      </tr>`
    })

    taskRowHtml += `</tbody>
  </table>`


  }

  let signatureHtml = "";
    if (signature) {
      signatureHtml = `
      <img src="${signature}" alt="Signature" style="width: 50px;" />
      `
    }

  const htmlContent = `<!DOCTYPE html>
<html>

<head>
  <title>Job Hazard Analysis (JHA)</title>
  <style>
    p {
      margin: 4px 0px;
    }

    body {
      font-family: Arial, sans-serif;
      margin: 0px;
      padding: 30px;}

    .header-title {
      font-size: 55px;
      margin-bottom: 30px;
    }

    .container {
      width: 100%;
      padding: 10px;
    }

    .section {
      margin-bottom: 20px;
      width: 35%;

    }

    .section-title {
      font-weight: bold;
      font-size: 1.2em;
      margin-bottom: 10px;
      text-decoration: underline;
    }

    .checkbox-list {
      width: 300px;
      display: flex;
      flex-wrap: wrap;
    }

    .checkbox-item {
      width: 250px;
      margin-bottom: 5px;
    }

    .header {
      text-align: center;
      font-size: 24px;
      font-weight: bold;
      background-color: #486ECD;
      color: white;
      padding: 10px;
      border-radius: 5px;
      margin-bottom: 10px;
    }

    table {
      width: 100%;
      border-collapse: collapse;
    }
    th, td {
      border: 1px solid black;
      padding: 8px 4px;
      text-align: left;
      vertical-align: top;

    }
    th {
      background-color: rgb(228, 209, 102);
      text-align: center;
    }
    .bold {
      font-weight: bold;
      color: #000000;
    }

    .logo {
      margin-bottom: 10px;
      height: 50px;
    }

    .side-logo {
      margin-bottom: 10px;
      height: 100px;
    }

    .JHAtriangle-logo {
      /* position: absolute;
        top: 20px;
        right: 100px; */
      height: 180px;
    }

    .img-container {
      width: 100%;
      padding: 10px;
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
    }
   
  </style>
</head>

<body>
  <div class="container">
    <div class="img-container">
      <img src="${companyLogo}" alt="Company Logo"
        class="side-logo" />
      

      <img src="${triangleJHA}" alt="JHAtriangle" class="JHAtriangle-logo" />
<img src="${squareJHA}" alt="JHAtriangle" class="JHAtriangle-logo" />

    </div>
<div class="header-title">Job Hazard Analysis (JHA)</div>
    <div>
      <p><span class="bold">Date:</span>${selectedDate || 'N/A'}</p>
      <p><span class="bold">Time:</span>${time || 'N/A'}</p>
      <p><span class="bold">Project Location:</span>${location || 'N/A'}</p>
      <p><span class="bold">Project Name:</span> ${projectName || 'N/A'}</p>
      <p><span class="bold">Description:</span> ${description || 'N/A'}</p>
    </div>

 ${harardSelectionHtml}
    <div style="display: flex; flex-wrap: wrap; width: 100%; justify-content: space-between; margin-top: 20px;">
      
    </div>


  </div>


 ${taskRowHtml}

  <div style=" width:100%; display:flex; justify-content: space-between; margin-top: 50px;">
    <p><span class="bold">Have you completed site orientation? :</span> ${siteOrientationChecked }</p>
    <p><span class="bold">Have you completed tool box meeting? :</span> ${toolBoxMeetingChecked}</p>
  </div>

  <div style="display: flex; flex-direction: row; width: 100%; border: 1px solid #ccc; margin-top: 40px;">
    <div style="width: 50%;height: 100px; padding: 10px;">

    <p><span class="bold">Reviewed By :</span> </p>
    <p><span class="bold">Date Reviewed :</span> </p>
    <div style="display: flex; flex-direction: row; width: 50%; height: 100px; padding: 10px 0px; ">
      <p class="bold">Signature : </p>
       

      <div>
      </div>


    </div>
    </div>

    <div style="width: 1px; background-color: #ccc;">

    </div>

    <div style="width: 50%;height: 100px;">
         
        <div style="width: 100%;">
          <div style="display: flex; flex-direction: row; border-bottom: 1px solid #ccc;">
            <p style="width: 50%; text-align: center;  font-weight: bold;
      color: #000000;">Worker's Name</p>
      <div style="width: 1px;  background-color: #ccc;"></div>
            <p  style="width: 50%; text-align: center;  font-weight: bold;
      color: #000000;">Signature</p>
          </div>

          <div style="display: flex; flex-direction: row;  border-bottom: 1px solid #ccc;">
            <p style="width: 50%; text-align: center;">${workerName}</p>
            <div style="width: 1px; background-color: #ccc;">
            
            </div>

            <p  style="width: 50%; text-align: center;"> 
             ${signatureHtml}
     </p>
          </div>
          
        </div>

    </div>

  </div>
</body>

</html>`


// console.log("htmlContent : ",htmlContent)/
try {
  // Generate the PDF
  const REPORTS_FOLDER = FileSystem.documentDirectory + "JHA_Reports/";
  const folderExists = await FileSystem.getInfoAsync(REPORTS_FOLDER);
  if (!folderExists.exists) {
    await FileSystem.makeDirectoryAsync(REPORTS_FOLDER, { intermediates: true });
  }
  const { uri } = await Print.printToFileAsync({ html: htmlContent,width:1000 });
  const fileUri = REPORTS_FOLDER + `${moment().format("DD_MM_YYYY_HH_mm_ss")}_JHA_ANALYSIS.pdf`;

  // Move file to a readable location
  await FileSystem.moveAsync({ from: uri, to: fileUri });

  // Share the generated PDF file
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(fileUri);
  }
} catch (error) {
  Alert.alert("Error", error.message);
}
}





