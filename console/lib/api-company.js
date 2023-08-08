import { request } from "./api-base";
import { append, document, documents, save, update } from "./api-firebase";

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

export const invoice = (invoiceId) =>
  document('invoices', invoiceId);

export const invoices = (options) =>
  documents('invoices', options);

export const createInvoice = async (userId, invoice) => {
  // @todo: 找不到公司名稱時應如何處理？
  const { companyName : sellerName} = await companyInfo(invoice.sellerBAN).catch(err=>({companyName: ''}));
  const { companyName: buyerName } = await companyInfo(invoice.buyerBAN).catch(err=>({companyName: ''}));

  for(let i = 0; i < invoice.items.length; i++){
    let { price, quantity } = invoice.items[i];
    invoice.items[i].amount = parseFloat(price) * parseFloat(quantity);
  }

  const subtotal = !!invoice?.items ? 
    invoice.items.reduce((pre, cur)=> 
      pre + parseFloat(cur.price) * parseFloat(cur.quantity), 0):0;
  const tax = invoice?.taxType === 1 ? Math.round(subtotal * 0.05) : 0;
  const amount = subtotal + tax;

  const invoiceData = {
    ...invoice,
    date: new Date(),
    owner: userId,
    sellerName,
    buyerName,
    subtotal,
    tax,
    amount,
    createAt: new Date()
  };

  const { id: invoiceId } = await append('invoices', invoiceData);
  await update('invoices', invoiceId, { id: invoiceId});
  return invoiceId;
}

export const updateInvoice = (invoiceId, invoice) => 
  update('invoices', invoiceId, invoice);

export const companyInfo = async (companyBAN) => 
  request(`/api/company/${companyBAN}`);