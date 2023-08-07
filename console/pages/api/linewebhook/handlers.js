const { LIFF_URL } = process.env;

export const onText = (event) => {
  switch(event.message.text){

    case "小幫手":
      return {
        type: 'template',
        altText: '你好，需要我幫什麼忙呢？',
        template: {
          type: 'buttons',
          title: '設定',
          text: '點擊按鈕開啟公司設定',
          actions: [
            {
              type: 'uri',
              label: '設定',
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

    // do nothing by default
    default:
      return null;
  }
}