import moment from "moment";
import { request } from "./api-base";
import { append, document, documents, exist, save, update } from "./api-firebase";
import { attachInvoiceCalculation } from "./util-invoice";
import { FieldPath, Firestore, orderBy } from "firebase/firestore";

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

export const nextInvoiceNumber = async (companyBAN) => {
  const date = new Date();
  const month = date.getMonth();
  const monthGroup = Math.floor(month / 2) * 2; // 0: 1-2, 2: 3-4, 4: 5-6
  const group = `${date.getFullYear()}-${String(monthGroup+1).padStart(2, '0')}-${String(monthGroup+2).padStart(2,'0')}`;
  const available = true;
  const order = orderBy('begin', 'asc');
  const results = await documents(`/companies/${companyBAN}/invoice-packages`, {group, available, order});
  const [ { prefix, begin, end, cursor } ] = results;
  const beginValue = parseInt(begin);
  const endValue = parseInt(end);
  const cursorValue = parseInt(cursor);
  const nextValue = cursorValue+1;
  const isAvailable = nextValue < endValue;
  const nextInvoiceNumberValue = `${prefix}${String(nextValue).padStart(8, '0')}`;
  
  // todo: 檢查有沒有跳號的風險
  await update(`/companies/${companyBAN}/invoice-packages`, `${group}-${begin}`, {
    cursor: nextInvoiceNumberValue,
    available: isAvailable
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

export const createInvoice = async (userId, invoice) => {
  // @todo: 找不到公司名稱時應如何處理？
  const config = await lineUserConfig(userId);
  const [sellerBAN] = config.companies;
  const { 
    companyName: sellerName,
    companyAddress: sellerAddress
  } = await companyInfo(sellerBAN).catch(err => {console.error(err); return {companyName: ''}});
  const { 
    companyName: buyerName,
    companyAddress: buyerAddress
  } = await companyInfo(invoice?.buyerBAN).catch(err => {console.error(err); return {companyName: ''}});

  // @todo: invoiceId 應該改用發票字軌
  // @todo: 如果目標日期不是當天，應該要排程到當天再開立發票，以確保發票字軌管理正確
  // @todo: 避免 invoiceId 重複時，覆蓋別人的發票
  const createAt = new Date();
  const invoiceId = await nextInvoiceNumber(sellerBAN);
  const invoiceDate = invoice?.date ?? createAt;
  const invoiceData = attachInvoiceCalculation({
    ...invoice,
    invoiceId,
    owner: userId,
    sellerBAN,
    sellerName,
    sellerAddress,
    buyerName,
    buyerAddress,
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

export const companyInfo = async (companyBAN) => {
  const host = typeof window !== 'undefined' ? '' : 'https://bot.printii.com';
  return request(`${host}/api/company/${companyBAN}`);
}