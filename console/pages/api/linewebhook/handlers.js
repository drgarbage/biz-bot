import { createInvoice } from "@/lib/api-company";
import { createInvliceFlexMessage, invoiceFootActions, invoiceHeadMessage } from "@/lib/bot-messages";
import { attachInvoiceCalculation, evenRound } from "@/lib/util-invoice";
const { LIFF_URL } = process.env;

const parseSellerName = text =>
    text.match(/幫我開(?<sellerName>\S+)?發票/).groups.sellerName;

const parseBuyerName = text => {
    const match = text.match(/(?:給|抬頭\s*[：:]?\s*)(?<buyerName>\S+)/);
    return match && match.groups && match.groups.buyerName ? match.groups.buyerName : null;
};

const parseBuyerBAN = text => {
    const match = text.match(/統編\s*[:：]?\s*(?<buyerBAN>\d{8})/);
    return match && match.groups && match.groups.buyerBAN ? match.groups.buyerBAN : null;
};

const parseAmount = text => {
    const match = text.match(/金額\s*[:：]?\s*(?<rawAmount>[$,0-9]+)/);
    return match && match.groups && match.groups.rawAmount ? match.groups.rawAmount : null;
};
    
const parseTaxMethod = text =>
    text.match(/(?<taxMethod>含稅|未稅|稅外加)/).groups.taxMethod;

const parseSingleItemName = text => {
    const match = text.match(/品項\s*[:：]?\s*(?<singleItemName>\S+)/);
    return match && match.groups && match.groups.singleItemName ? match.groups.singleItemName : null;
};

const parseDate = (text) => {
    const regex = /(?:(?<year>\d{2,4})[ 年/-])?(?:(?<month>\d{1,2})[ 月/-])?(?<day>\d{1,2})[ 日號]?/;
    const match = text.match(regex);

    if (match && match.groups) {
        const currentDate = new Date();
        const year = match.groups.year ? parseInt(match.groups.year, 10) : currentDate.getFullYear();
        const month = match.groups.month ? parseInt(match.groups.month, 10) - 1 : currentDate.getMonth(); // JavaScript 的月份是從 0 開始的
        const day = parseInt(match.groups.day, 10);

        return new Date(year, month, day);
    }

    return new Date();
};

const parseInvoiceMessage = text => ({
  date: parseDate(text),
  sellerName: parseSellerName(text),
  buyerName: parseBuyerName(text),
  buyerBAN: parseBuyerBAN(text),
  taxMethod: parseTaxMethod(text),
  amount: parseAmount(text),
  items: [{
      name: parseSingleItemName(input),
      quantity: 1
  }]
});

const parseInvoice = (message) => {
  const regexSingle = /幫我開發票給(.+) 統編(.+) (.+) 金額(.+) (含稅|稅外加)/;
  const regexMultiple = /幫我開發票給(.+) 統編(.+)((\n-.+)+)/;

  const matchSingle = message.match(regexSingle);
  const matchMultiple = message.match(regexMultiple);

  if (matchSingle) {
    const buyerName = matchSingle[1];
    const buyerBAN = matchSingle[2];
    const itemName = matchSingle[3];
    const rawAmount = parseFloat(matchSingle[4]);
    const isTaxInclude = matchSingle[5] === '含稅';
    const taxType = 1;
    const itemAmount = isTaxInclude ? evenRound(rawAmount / 1.05) : rawAmount;
    const targetAmount = isTaxInclude ? rawAmount : null;

    return attachInvoiceCalculation({
      date: new Date,
      buyerBAN,
      buyerName,
      taxType,
      items: [
        {
          name: itemName,
          price: itemAmount,
          quantity: 1
        }
      ]
    }, targetAmount );
  }

  if (matchMultiple) {
    const buyerName = matchMultiple[1];
    const buyerBAN = matchMultiple[2];
    const itemsString = matchMultiple[3];

    // 處理多筆商品
    const itemsRegex = /-\s(.+)\s(.+)\s(.+)/g;
    let items = [];
    let match;
    while ((match = itemsRegex.exec(itemsString))) {
      const itemName = match[1];
      const price = parseFloat(match[2]);
      const quantity = parseInt(match[3]);

      items.push({
        name: itemName,
        price,
        quantity,
      });
    }

    const taxType = 1;
    
    return attachInvoiceCalculation({
      date: new Date(),
      buyerBAN,
      buyerName,
      taxType,
      items
    });
  }

  return null; // 無效的格式
};

const handleInvoiceCreate = async (event) => {
  try{

    const recognizedInvoice = parseInvoice(event.message.text);
  
    if(!recognizedInvoice) {
      return {
        type: 'text',
        text: '很抱歉，我不認得您指定的格式，請參考以下格式：\n幫我開發票給[買方公司名稱] 統編[買方統編] [品名] 金額[金額] [含稅|稅外加]'
      }
    }
  
    const invoice = await createInvoice(event.source.userId, recognizedInvoice);
  
    return createInvliceFlexMessage(invoice, {
      header: invoiceHeadMessage("已為您開立發票內容如下"),
      footer: invoiceFootActions([{
        type: 'uri',
        label: '變更內容',
        uri: `${LIFF_URL}/invoices/${invoice?.id}/edit`,
      }]),
    });

  }catch(err){

    return {
      type: 'text',
      text: `很抱歉，在開發票的過程中發生一些錯誤。\n\n錯誤：${err.message}`
    };
    
  }

}


export const onText = (event) => {

  if(event.message.text.startsWith('幫我開發票')) {
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
            uri: 'https://bot.printii.com/agents/0/customers', 
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