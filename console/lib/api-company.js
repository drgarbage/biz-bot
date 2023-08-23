import { request } from "./api-base";
import { append, document, documents, save, update } from "./api-firebase";
import { attachInvoiceCalculation } from "./util-invoice";

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

// export const company = async (companyBAN) =>
//   document('companies', companyBAN);

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

  const invoiceData = attachInvoiceCalculation({
    date: new Date(),
    ...invoice,
    owner: userId,
    sellerBAN,
    sellerName,
    sellerAddress,
    buyerName,
    buyerAddress,
    createAt: new Date()
  });

  const { id: invoiceId } = await append('invoices', invoiceData);
  await update('invoices', invoiceId, { id: invoiceId});
  return { id: invoiceId, ...invoiceData};
}

export const updateInvoice = (invoiceId, invoice) => 
  update('invoices', invoiceId, invoice);

export const companyInfo = async (companyBAN) => {
  const host = typeof window !== 'undefined' ? '' : 'https://bot.printii.com';
  return request(`${host}/api/company/${companyBAN}`);
}