import moment from "moment";
import { request } from "./api-base";
import { document, documents, exist, save, update, remove } from "./api-firebase";
import { attachInvoiceCalculation } from "./util-invoice";
import { orderBy } from "firebase/firestore";

export const register = async (lineProfile) => {
  let lineUserConfig = await document(`line-users`, lineProfile.userId);

  if(!lineUserConfig) {
    // todo: bind firebase auth
    lineUserConfig = {
      userId: lineProfile.userId,
      displayName: lineProfile.displayName,
      pictureUrl: lineProfile.pictureUrl,
      eInvoiceAccount: null,
      eInvoicePassword: null,
      companies: [],
      createAt: new Date()
    };
    await save('line-users', lineProfile.userId, lineUserConfig);
  }

  return lineUserConfig;
}

export const updateRegisteration = async (lineProfile) => 
  update('line-users', lineProfile.userId, lineProfile);

export const appendInvoicePackage = async (companyBAN, {group, prefix, begin, end}) => {
  const createAt = new Date();
  const id = `${group}-${prefix}${begin}`;
  const path = `/companies/${companyBAN}/invoice-packages`;

  if(await exist(path, id)) 
    throw new Error("Package existed.");

  await save(path, id, {
      id,
      group,
      prefix,
      begin,
      end,
      cursor: begin,
      available: true,
      createAt
  });
}

export const appendInvoicePackagesByCSV = async (companyBAN, csv) => {
  const lines = csv.split('\n');
  const createAt = new Date();
  for(let i = 1; i < lines.length; i++) {
    // todo: check data and do error handling
    let [, , , invoicePeriod, prefix, begin, end] = lines[i].split(',').map(v => v.trim());
    
    if(!invoicePeriod || !prefix || !begin || !end) 
      continue;

    let [startDate] = invoicePeriod.split(' ~ ');
    let [year, month] = startDate.split('/').map(Number);
    let adYear = year + 1911;
    let group = `${adYear}-${String(month).padStart(2, '0')}-${String(month+1).padStart(2, '0')}`;
    let id = `${group}-${prefix}${begin}`;
    let path = `/companies/${companyBAN}/invoice-packages`;

    // todo: compare companyBAN

    if(await exist(path, id)) 
      continue;

    await save(path, id, {
      id,
      group,
      prefix,
      begin,
      end,
      cursor: begin,
      available: true,
      createAt
    });
  }
}

export const deleteInvoicePackage = (companyBAN, id) => 
  remove(`/companies/${companyBAN}/invoice-packages`, id);

export const invoicePackages = async (companyBAN, month, includePreviousMonth = false) => {
  const results = [];
  const date = new Date();
  const monthGroup = Math.floor(month / 2) * 2; // 0: 1-2, 2: 3-4, 4: 5-6
  const group = `${date.getFullYear()}-${String(monthGroup+1).padStart(2, '0')}-${String(monthGroup+2).padStart(2,'0')}`;
  const rs = await documents(`/companies/${companyBAN}/invoice-packages`, {group});
  results.push(...rs);

  if(includePreviousMonth) {
    const prevMonthGroup = monthGroup - 2;
    const prevGroup = `${date.getFullYear()}-${String(prevMonthGroup+1).padStart(2, '0')}-${String(prevMonthGroup+2).padStart(2,'0')}`;
    const rsPrev = await documents(`/companies/${companyBAN}/invoice-packages`, {group: prevGroup});
    results.push(...rsPrev);
  }

  return results;
}

export const invoicePackagesByGroup = (companyBAN, group) =>
  documents(`/companies/${companyBAN}/invoice-packages`, {group});

export const nextInvoiceNumber = async (companyBAN, targetInvoiceDate) => {
  const date = new Date();
  const month = date.getMonth();
  const monthGroup = Math.floor(month / 2) * 2; // 0: 1-2, 2: 3-4, 4: 5-6
  const group = `${date.getFullYear()}-${String(monthGroup+1).padStart(2, '0')}-${String(monthGroup+2).padStart(2,'0')}`;
  const available = true;
  const order = orderBy('begin', 'asc');
  const results = await documents(`/companies/${companyBAN}/invoice-packages`, {group, available, order});

  if (results.length == 0)
    throw new Error(`找不到適用${group}的發票字軌，請檢查您的字軌設定`);

  const [ { prefix, begin, end, cursor, lastInvoiceDate } ] = results;

  // todo: 應該根據指定的日期來決定 group

  const endValue = parseInt(end);
  const cursorValue = parseInt(cursor);
  const nextValue = cursorValue+1;
  const isAvailable = nextValue < endValue;
  const nextInvoiceNumberValue = `${prefix}${String(nextValue).padStart(8, '0')}`;

  const mLastDate = moment(lastInvoiceDate?.toDate() || new Date());
  const mTargetDate = moment(targetInvoiceDate);

  // todo: 檢查時間是否連貫
  // todo: 同一天還是可以開
  if(!!lastInvoiceDate && mTargetDate.isBefore(mLastDate))
    throw new Error(`發票時間早於上次開立之發票 (${mTargetDate.format('yyyy/MM/DD')} < ${mLastDate.format('yyyy/MM/DD')})`);
  
  // todo: 檢查有沒有跳號的風險
  await update(`/companies/${companyBAN}/invoice-packages`, `${group}-${prefix}${begin}`, {
    cursor: String(nextValue).padStart(8, '0'),
    available: isAvailable,
    lastInvoiceDate: targetInvoiceDate
  });
  
  return nextInvoiceNumberValue;
}

export const setupLineUserConfig = async ({
  userId,
  companyBAN, 
  eInvoiceAccount, 
  eInvoicePassword
}) => 
  update('line-users', userId, {
    eInvoiceAccount,
    eInvoicePassword,
    companies: [companyBAN]
  });

export const lineUserConfig = (userId) =>
  document('line-users', userId);

export const invoice = (invoiceId) =>
  document('invoices', invoiceId);

export const invoices = (options) =>
  documents('invoices', options);

export const createInvoice = async (userId, sellerBAN, invoice) => {
  // @todo: 找不到公司名稱時應如何處理？
  // @todo: 開之前檢查目標日期是否跟過去不連貫
  const { 
    companyName: sellerName,
    companyAddress: sellerAddress,
    companyPhoneNumber: sellerPhoneNumber = '',
  } = await companyInfo(sellerBAN).catch(err => {console.error(err); return {companyName: '', companyAddress: ''}});
  const { 
    companyName: buyerName,
    companyAddress: buyerAddress,
    companyPhoneNumber: buyerPhoneNumber = '',
  } = await companyInfo(invoice?.buyerBAN).catch(err => {console.error(err); return {companyName: '', companyAddress: ''}});

  // @todo: invoiceId 應該改用發票字軌
  // @todo: 如果目標日期不是當天，應該要排程到當天再開立發票，以確保發票字軌管理正確
  // @todo: 避免 invoiceId 重複時，覆蓋別人的發票
  const createAt = new Date();
  const invoiceDate = invoice?.date ?? createAt;
  const invoiceId = await nextInvoiceNumber(sellerBAN, invoiceDate);
  const invoiceData = attachInvoiceCalculation({
    ...invoice,
    invoiceId,
    owner: userId,
    sellerBAN,
    sellerName,
    sellerAddress,
    sellerPhoneNumber,
    buyerName,
    buyerAddress,
    buyerPhoneNumber,
    date: invoiceDate,
    createAt
  });


  // const { id: invoiceId } = await append('invoices', invoiceData);
  // await update('invoices', invoiceId, { id: invoiceId});
  // return { id: invoiceId, ...invoiceData};
  await save('invoices', invoiceId, invoiceData);
  return invoiceData;
}

export const updateInvoice = (invoiceId, invoice) => 
  update('invoices', invoiceId, invoice);

export const companyConfigs = async (companyBAN) => 
  document('companies', companyBAN);

export const saveCompanyConfigs = async (companyBAN, configs) =>
  save('companies', companyBAN, configs);

export const updateCompanyConfigs = async (companyBAN, changes) =>
  update('companies', companyBAN, changes);

export const companyInfo = async (companyBAN) => {
  const isBrowser = typeof window !== 'undefined';
  const [config, info] = await Promise.all([
    companyConfigs(companyBAN),
    isBrowser ?
      request(`/api/company/${companyBAN}`):
      nativeFetchCompanyInfo(companyBAN)
  ]);
  return {...config, ...info};
}

export const findCompany = async (userId, query = null) => {
  const profile = await lineUserConfig(userId);
  const { companies } = profile;
  
  if(!query)
    return companies[0];

  if(companies.indexOf(query) >= 0)
    return query;

  for(let i = 0; i < companies.length; i++){
    const companyBAN = companies[i];
    const info = await companyInfo(companyBAN);
    if( info.companyName.indexOf(query) >= 0 || 
        info.companyBAN.indexOf(query) >= 0 )
      return companyBAN;
  }

  return companies[0];
}

// https://eip.fia.gov.tw/OAI/api/businessRegistration/91543313
// https://data.gcis.nat.gov.tw/od/data/api/5F64D864-61CB-4D0D-8AD9-492047CC1EA6?$format=json&$filter=Business_Accounting_NO eq 

export const serviceCompanyInfoViaEInvoice = async (companyBAN) => {
  const [rs] = await request(`https://dataset.einvoice.nat.gov.tw/ods/portal/api/v1/InvoiceBusinessList?busiBan=${companyBAN}`);

  if(!rs) 
    throw new Error('Not found.');

  return {
    companyBAN,
    companyName: rs?.busiNm ?? '',
    companyAddress: rs?.address ?? ''
  }
}
export const serviceCompanyInfoViaGCIS = async (companyBAN) => {
  const [rs] = await request(`https://data.gcis.nat.gov.tw/od/data/api/5F64D864-61CB-4D0D-8AD9-492047CC1EA6?$format=json&$filter=Business_Accounting_NO eq ${companyBAN}`);
  
  if(!rs)
    throw new Error('Not found.');

  return {
    companyBAN,
    companyName: rs?.Company_Name ?? '',
    companyAddress: rs?.Company_Location ?? ''
  };
}
export const serviceCompanyInfoViaEIP = async (companyBAN) => {
  const rs = await request(`https://eip.fia.gov.tw/OAI/api/businessRegistration/${companyBAN}`);
  return {
    companyBAN,
    companyName: rs?.businessNm ?? '',
    companyAddress: rs?.businessAddress ?? ''
  };
}
export const nativeFetchCompanyInfo = async (companyBAN) => {
  return Promise.race([
    serviceCompanyInfoViaEInvoice(companyBAN),
    serviceCompanyInfoViaGCIS(companyBAN),
    serviceCompanyInfoViaEIP(companyBAN),
  ]);
}