function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);

    const sheet = SpreadsheetApp.openById("1x37-WMX5C5kmcjr4u8gMzwIoaeT3MJL2lQY-Xf57UBo")
      .getSheetByName("山田太郎");
    sheet.appendRow([data.name]);
        
    return ContentService.createTextOutput(
      JSON.stringify({ status: "success" })
    ).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(
      JSON.stringify({ status: "error", message: err.toString() })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}
