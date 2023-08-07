"use strict";
const axios = require('axios');

const request = async (url, options = {}) => {
  const { method = 'GET', headers = {}, body = undefined } = options;

  const config = {
    method,
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      ...headers
    },
    data: body ? JSON.stringify(body) : undefined
  };

  const response = await axios(url, config);

  if (response.status < 200 || response.status >= 300) 
    throw new Error('Network Error');

  return response.data;
};

const companyInfo = async (companyId) => {
  const rs = await request(`https://data.gcis.nat.gov.tw/od/data/api/5F64D864-61CB-4D0D-8AD9-492047CC1EA6?$format=json&$filter=Business_Accounting_NO eq ${companyId}`);
  if(rs.length == 0) return null;
  return {
    companyId,
    companyName: rs[0]['Company_Name'],
    companyAddress: rs[0]['Company_Location'],
    companyAccountingNo: rs[0]['Business_Accounting_NO']
  };
}

module.exports = {
  request, companyInfo
}