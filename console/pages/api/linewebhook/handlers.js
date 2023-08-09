import moment from "moment";
const { LIFF_URL } = process.env;

const createInvliceFlexMessage = (invoice) => {
  const { date = new Date(), buyerBAN, buyerName, tax, amount } = invoice;
  
  const contents = {
    type: 'bubble',
    header: {
      type: "box",
      layout: "vertical",
      contents: [
        {
          "type": "text",
          "text": "已為您開立發票內容如下"
        }
      ]
    },
    body: {
      type: 'box',
      layout: 'vertical',
      contents: [
        {
          type: 'text',
          text: buyerName,
          weight: 'bold',
          size: 'xl',
        },
        {
          type: 'box',
          layout: 'vertical',
          margin: 'lg',
          spacing: 'sm',
          contents: [
            {
              type: 'box',
              layout: 'baseline',
              spacing: 'sm',
              contents: [
                {
                  type: 'text',
                  text: '統一編號',
                  color: '#aaaaaa',
                  size: 'sm',
                  flex: 1,
                },
                {
                  type: 'text',
                  text: buyerBAN,
                  wrap: true,
                  color: '#666666',
                  size: 'sm',
                  flex: 3,
                },
              ],
            },
            {
              type: 'box',
              layout: 'baseline',
              spacing: 'sm',
              contents: [
                {
                  type: 'text',
                  text: '發票日期',
                  color: '#aaaaaa',
                  size: 'sm',
                  flex: 1,
                },
                {
                  type: 'text',
                  text: moment(date).format('yyyy 年 MM 月 DD 日'), // todo: handle date type
                  wrap: true,
                  color: '#666666',
                  size: 'sm',
                  flex: 3,
                },
              ],
            },
          ],
        },
        {
          type: 'separator',
          margin: '10px',
        },
        ...invoice.items.map((item) => ({
          type: 'box',
          layout: 'horizontal',
          contents: [
            {
              type: 'text',
              text: item.name,
            },
            {
              type: 'text',
              text: item.quantity.toString(),
              align: 'end',
            },
            {
              type: 'text',
              text: item.price.toFixed(0),
              align: 'end',
            },
          ],
          margin: '10px',
        })),
        {
          type: 'separator',
          margin: '10px',
        },
        {
          type: 'box',
          layout: 'horizontal',
          contents: [
            {
              type: 'text',
              text: '稅額',
            },
            {
              type: 'text',
              text: tax.toFixed(),
              align: 'end',
            },
          ],
          margin: '10px',
        },
        {
          type: 'separator',
          margin: '10px',
        },
        {
          type: 'box',
          layout: 'horizontal',
          contents: [
            {
              type: 'text',
              text: '總計',
            },
            {
              type: 'text',
              text: amount.toFixed(),
              size: '32px',
              align: 'end',
            },
          ],
          margin: '10px',
        },
      ],
    },
    footer: {
      type: 'box',
      layout: 'vertical',
      spacing: 'sm',
      contents: [
        {
          type: 'button',
          action: {
            type: 'uri',
            label: '變更內容',
            uri: `${LIFF_URL}/invoices/${invoice?.id}/edit`,
          },
        },
      ],
      flex: 0,
      margin: '10px',
    },
    styles: {
      body: {
        backgroundColor: '#EEEEEE',
      },
    },
  };

  return {
    type: 'flex',
    altText: `開立發票金額 ${amount.toFixed()} 給 ${buyerName}`,
    contents
  }
};

const handleInvoiceCreate = (message) => {
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
    const total = isTaxInclude ? rawAmount / 1.05 : rawAmount;
    const tax = total * 0.05;
    const amount = total + tax;
    

    return {
      date: new Date,
      buyerBAN,
      buyerName,
      total,
      taxType,
      tax,
      amount,
      items: [
        {
          name: itemName,
          price: total,
          quantity: 1
        }
      ]
    };
  }

  if (matchMultiple) {
    const buyerName = matchMultiple[1];
    const buyerBAN = matchMultiple[2];
    const itemsString = matchMultiple[3];

    // 處理多筆商品
    const itemsRegex = /-\s(.+)\s(.+)\s(.+)/g;
    let total = 0;
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

      total += price * quantity;
    }

    const tax = total * 0.05;
    const taxType = 1;
    const amount = total + tax;

    return {
      date: new Date(),
      buyerBAN,
      buyerName,
      total,
      tax,
      taxType,
      amount,
      items
    };
  }

  return null; // 無效的格式
};

export const onText = (event) => {

  if(event.message.text.startsWith('幫我開發票')) {
    const invoice = handleInvoiceCreate(event.message.text);
    // todo: save invoice
    return createInvliceFlexMessage(invoice);
  }
  
  if(event.message.text === '小幫手') {
    return {
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
            label: '開發票',
            uri: LIFF_URL + '/invoices/create', 
          }
        ]
      }
    };
  }

  return null;
}