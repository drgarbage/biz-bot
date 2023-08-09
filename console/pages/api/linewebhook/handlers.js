import { createInvoice } from "@/lib/api-company";
import { createInvliceFlexMessage, invoiceFootActions, invoiceHeadMessage } from "@/lib/bot-messages";
import { attachInvoiceCalculation, evenRound } from "@/lib/util-invoice";
const { LIFF_URL } = process.env;

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
    });
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