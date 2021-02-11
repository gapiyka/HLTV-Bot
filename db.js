'use strict';

const { GoogleSpreadsheet } = require('google-spreadsheet');

async function accessSpreadsheet() {
    const doc = new GoogleSpreadsheet(process.env.DATA_BASE);
    await doc.useServiceAccountAuth({
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/gm, '\n'),
    });
    await doc.loadInfo();
    const sheet = doc.sheetsByIndex[0];
    return sheet;
}

async function CopyData() {
    const sheet = await accessSpreadsheet();
    const dataArray = [];
    const rows = await sheet.getRows();

    await rows.forEach(row => {
        dataArray.push({ userID: row._rawData[0], subs: row._rawData[1].toString().split(';') });
    });
    return dataArray;
}

async function AddRow(user, sub) {
    const sheet = await accessSpreadsheet();
    const newSheet = await sheet.addRow({ User: user, Sub: `${sub}` });
}

async function ChangeRow(user, sub) {
    const sheet = await accessSpreadsheet();
    const rows = await sheet.getRows();

    const userIndex = rows.findIndex(x => { if (x._rawData[0] == user) return x });
    let SubsStr = rows[userIndex].Sub.toString() + `;${sub}`;
    rows[userIndex].Sub = SubsStr;
    rows[userIndex].save();
}

async function ClearSubs(user) {
    const sheet = await accessSpreadsheet();
    const rows = await sheet.getRows();

    const userIndex = rows.findIndex(x => { if (x._rawData[0] == user) return x });
    rows[userIndex].Sub = '';
    rows[userIndex].save();
}


module.exports = {
    CopyData,
    AddRow,
    ChangeRow,
    ClearSubs,
}