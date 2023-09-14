import { createInvoice, findCompany, register } from "@/lib/api-company";
import { createInvliceFlexMessage, invoiceFootActions, invoiceHeadMessage } from "@/lib/bot-messages";
import { attachInvoiceCalculation, evenRound } from "@/lib/util-invoice";
const { LIFF_URL, HOST_URL } = process.env;

const parseSellerName = text => {
  const match = text.match(/幫我開(?<sellerName>\S+)?發票/);
  return match?.groups?.sellerName ?? null;
};

const parseBuyerName = text => {
  const match = text.match(/(?:給|抬頭\s*[:：]?\s*)(?<buyerName>\S+)/);
  return match?.groups?.buyerName ?? null;
};

const parseBuyerBAN = text => {
  const match = text.match(/統編\s*[:：]?\s*(?<buyerBAN>\d{8})/);
  return match?.groups?.buyerBAN ?? null;
};

const parseAmount = text => {
  const match = text.match(/金額\s*[:：]?\s*[NT$]*\s*(?<rawAmount>[,.0-9]+)/);
  const rawAmount = (match?.groups?.rawAmount ?? '0').replace(/[^0-9.-]+/g,"");
  return Number.parseFloat(rawAmount);
};
    
const parseTaxMethod = text => {
  const match = text.match(/(?<taxMethod>含稅|未稅|稅外加)/);
  return match?.groups?.taxMethod ?? '未稅';
};

const parseSingleItemName = text => {
  const match = text.match(/品項|品名\s*[:：]?\s*(?<singleItemName>\S+)/);
  return match?.groups?.singleItemName ?? null;
};

const parseDate = (text) => {
  const regex = /\b(?:(?<year>\d{2,4})[ 年/-])?(?:(?<month>\d{1,2})[ 月/-])?(?<day>\d{1,2})[ 日號]?\b/;
  const match = text.match(regex);
    
  if (match && match.groups) {
    const currentDate = new Date();
    const year = match.groups.year ? parseInt(match.groups.year, 10) : currentDate.getFullYear();
    const month = match.groups.month ? parseInt(match.groups.month, 10) - 1 : currentDate.getMonth(); // JavaScript 的月份是從 0 開始的
    const day = match.groups.day ? parseInt(match.groups.day, 10) : currentDate.getDay();
    return new Date(year < 1911 ? year + 1911 : year, month, day);
  }

  return moment().startOf('day').toDate();
};

const parseInvoice = (text) => {
  const isTaxInclude = parseTaxMethod(text) === '含稅';
  const rawAmount = parseAmount(text);
  const taxType = 1;
  const itemAmount = isTaxInclude ? evenRound(rawAmount / 1.05) : rawAmount;
  const targetAmount = isTaxInclude ? rawAmount : null;
  const invoice = {
    date: parseDate(text),
    sellerName: parseSellerName(text),
    buyerName: parseBuyerName(text),
    buyerBAN: parseBuyerBAN(text),
    taxType,
    items: [{
      name: parseSingleItemName(text),
      price: itemAmount,
      quantity: 1
    }]
  };

  return attachInvoiceCalculation(invoice, targetAmount);
};

const handleInvoiceCreate = async (event) => {
  try{

    const recognizedInvoice = parseInvoice(event.message.text);
  
    if(!recognizedInvoice) {
      return {
        type: 'text',
        text: '很抱歉，我不認得您指定的格式，請參考以下格式：\n\n幫我開發票\n日期：112/2/10\n抬頭：客戶公司名\n統編：12345678\n品名：商品名稱\n金額：NT50,000 含稅'
      };
    }

    // todo: 根據 sellerName 判斷要用哪個公司開發票
    const { sellerName } = recognizedInvoice;
    const userId = event?.source?.userId;
    const sellerBAN = await findCompany(userId, sellerName);
    const invoice = await createInvoice(userId, sellerBAN, recognizedInvoice);
  
    return createInvliceFlexMessage(invoice, {
      header: invoiceHeadMessage('已為您開立發票內容如下'),
      footer: invoiceFootActions([{
        type: 'uri',
        label: '變更內容',
        uri: `${LIFF_URL}/invoices/${invoice?.invoiceId}/edit`,
      },{
        type: 'uri',
        label: '下載PDF',
        uri: `${HOST_URL}/api/invoices/${invoice?.invoiceId}`,
      }]),
    });

  }catch(err){

    console.error(err.message);

    return {
      type: 'text',
      text: `很抱歉，在開發票的過程中發生一些錯誤。\n\n錯誤：${err.message}`
    };
    
  }

}


export const onText = (event) => {

  if(event.message.text.startsWith('幫我開') && event.message.text.indexOf('發票') >= 0) {
    return handleInvoiceCreate(event);
  }
  
  if(event.message.text === '小幫手') {
    return Promise.resolve({
      type: 'template',
      altText: '小幫手選單',
      template: {
        type: 'buttons',
        title: '小幫手',
        text: '你好，需要我幫什麼忙呢？',
        actions: [
          {
            type: 'uri',
            label: '變更我的公司資料',
            uri: LIFF_URL + '/setup', 
          },
          {
            type: 'uri',
            label: '發票管理',
            uri: `${HOST_URL}/agents/0/customers`, 
          },
          {
            type: 'uri',
            label: '開發票',
            uri: LIFF_URL + '/invoices/create', 
          }
        ]
      }
    });
  }

  return Promise.resolve(null);
}