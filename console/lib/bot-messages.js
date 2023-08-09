import moment from "moment";

export const createInvliceFlexMessage = (invoice, {header = null, footer = null}) => {
  const { date = new Date(), buyerBAN, buyerName, tax, amount } = invoice;
  
  const contents = {
    type: 'bubble',
    header,
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
    footer,
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

export const invoiceHeadMessage = (message) => !!message && {
  type: "box",
  layout: "vertical",
  contents: [
    {
      "type": "text",
      "text": message
    }
  ]
}

export const invoiceFootActions = (actions) => !!actions && actions.length > 0 && {
  type: 'box',
  layout: 'vertical',
  spacing: 'sm',
  contents: actions.map(action => ({
    type: 'button',
    action
  })),
  flex: 0,
  margin: '10px',
}