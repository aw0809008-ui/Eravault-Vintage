# 📊 Google Sheets Setup for Eravault Vintage

Follow these steps to connect your Google Sheet as a database.

## Step 1: Open Your Google Sheet

Your sheet: https://docs.google.com/spreadsheets/d/1AYeAU8i72yUG_l53Mg_uM7YycibnNMSeEkGYPnOLbrQ/edit

## Step 2: Create Headers in Row 1

Add these column headers in your first row (A1 to P1):

```
ID | Item Name | Category | Size | Grade | Cost | Price | Status | Sourcing Date | Sold Date | Notes | Listing Link | Images | Videos | Created | Updated
```

## Step 3: Create Apps Script

1. In Google Sheets, go to **Extensions → Apps Script**
2. Delete any existing code
3. Paste this code:

```javascript
// Eravault Vintage - Google Sheets Backend
const SHEET_NAME = 'Sheet1'; // Change if your sheet has a different name

function doGet(e) {
  const action = e.parameter.action;
  
  if (action === 'getAll') {
    return getAllItems();
  }
  
  return ContentService.createTextOutput(JSON.stringify({ error: 'Invalid action' }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  const data = JSON.parse(e.postData.contents);
  const action = data.action;
  
  if (action === 'add') {
    return addItem(data.item);
  } else if (action === 'update') {
    return updateItem(data.item);
  } else if (action === 'delete') {
    return deleteItem(data.id);
  }
  
  return ContentService.createTextOutput(JSON.stringify({ error: 'Invalid action' }))
    .setMimeType(ContentService.MimeType.JSON);
}

function getAllItems() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const items = [];
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0]) { // If ID exists
      const item = {};
      headers.forEach((header, index) => {
        const key = headerToKey(header);
        item[key] = data[i][index] || '';
      });
      items.push(item);
    }
  }
  
  return ContentService.createTextOutput(JSON.stringify({ items }))
    .setMimeType(ContentService.MimeType.JSON);
}

function addItem(item) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  const row = [
    item.id,
    item.itemName,
    item.category,
    item.size,
    item.condition,
    item.sourcingCost,
    item.sellingPrice || '',
    item.status,
    item.sourcingDate,
    item.soldDate || '',
    item.notes || '',
    item.listingLink || '',
    item.images || '',
    item.videos || '',
    item.createdAt,
    item.updatedAt
  ];
  
  sheet.appendRow(row);
  
  return ContentService.createTextOutput(JSON.stringify({ success: true, item }))
    .setMimeType(ContentService.MimeType.JSON);
}

function updateItem(item) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === item.id) {
      const row = [
        item.id,
        item.itemName,
        item.category,
        item.size,
        item.condition,
        item.sourcingCost,
        item.sellingPrice || '',
        item.status,
        item.sourcingDate,
        item.soldDate || '',
        item.notes || '',
        item.listingLink || '',
        item.images || '',
        item.videos || '',
        item.createdAt || data[i][14],
        item.updatedAt
      ];
      sheet.getRange(i + 1, 1, 1, row.length).setValues([row]);
      break;
    }
  }
  
  return ContentService.createTextOutput(JSON.stringify({ success: true }))
    .setMimeType(ContentService.MimeType.JSON);
}

function deleteItem(id) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === id) {
      sheet.deleteRow(i + 1);
      break;
    }
  }
  
  return ContentService.createTextOutput(JSON.stringify({ success: true }))
    .setMimeType(ContentService.MimeType.JSON);
}

function headerToKey(header) {
  const map = {
    'ID': 'id',
    'Item Name': 'itemName',
    'Category': 'category',
    'Size': 'size',
    'Grade': 'condition',
    'Cost': 'sourcingCost',
    'Price': 'sellingPrice',
    'Status': 'status',
    'Sourcing Date': 'sourcingDate',
    'Sold Date': 'soldDate',
    'Notes': 'notes',
    'Listing Link': 'listingLink',
    'Images': 'images',
    'Videos': 'videos',
    'Created': 'createdAt',
    'Updated': 'updatedAt'
  };
  return map[header] || header.toLowerCase().replace(/\s/g, '');
}
```

## Step 4: Deploy as Web App

1. Click **Deploy → New deployment**
2. Select type: **Web app**
3. Description: "Eravault API"
4. Execute as: **Me**
5. Who has access: **Anyone**
6. Click **Deploy**
7. **Copy the Web app URL**

## Step 5: Connect in Eravault

1. Open Eravault app
2. Go to **Settings**
3. Paste the Web app URL
4. Click **Save**
5. Click **Sync with Sheet**

## Done! 🎉

Your inventory will now sync with Google Sheets!

---

## Troubleshooting

**"Script function not found"**
- Make sure you copied all the code correctly

**"Authorization required"**
- Click "Review Permissions" and allow access

**Data not syncing**
- Check your column headers match exactly
- Try re-deploying the script
