const functions = require('firebase-functions');
const admin = require('firebase-admin');
const pdf = require('pdf-creator-node');
const fs = require('fs');
const moment = require('moment-timezone');

admin.initializeApp();

const firestore = admin.firestore();

function numberToChineseCapital(n) {
  const fraction = ['角', '分'];
  const digit = [
      '零', '壹', '貳', '參', '肆',
      '伍', '陸', '柒', '捌', '玖'
  ];
  const unit = [
      ['元', '萬', '億'],
      ['', '拾', '佰', '仟']
  ];
  let head = n < 0 ? '負' : '';
  n = Math.abs(n);

  let s = '';

  for (let i = 0; i < fraction.length; i++) {
      s += (digit[Math.floor(n * 10 * Math.pow(10, i)) % 10] + fraction[i]).replace(/零./, '');
  }
  s = s || '整';
  n = Math.floor(n);

  for (let i = 0; i < unit[0].length && n > 0; i++) {
      let p = '';
      for (let j = 0; j < unit[1].length && n > 0; j++) {
          p = digit[n % 10] + unit[1][j] + p;
          n = Math.floor(n / 10);
      }
      s = p.replace(/(零.)*零$/, '').replace(/^$/, '零') + unit[0][i] + s;
  }
  return head + s.replace(/(零.)*零元/, '元')
      .replace(/(零.)+/g, '零')
      .replace(/^整$/, '零元整');
}

exports.invoices = functions.https.onRequest(async (req, res) => {
  const invoiceId = req.params[0].split('/').reverse()[0] || req.query.id;
  
  try {
    const invoiceRef = firestore.collection('invoices').doc(invoiceId);
    const invoiceData = await invoiceRef.get();

    if (!invoiceData.exists) {
        res.status(404).send('Invoice not found');
        return;
    }

    const invoice = invoiceData.data();
    const data = {
      ...invoice,
      items: [...new Array(6).keys()].map((o,index) => {
        const item = invoice.items[index];
        if(!item) 
          return {};
        else 
          return {...item, amount: item.price * item.quantity};
      }),
      date: moment(invoice.date.toDate()).format('yyyy-MM-DD'),
      capitalAmount: numberToChineseCapital(invoice.amount)
    }

    // 讀取 template.html
    const html = fs.readFileSync('assets/template.html', 'utf8');
    const document = { html, data, path: "output.pdf", type: "buffer" };
    const options = {
      format: "A5",
      orientation: "landscape",
      border: "5mm",
    };
    const pdfBuffer = await pdf.create(document, options);
    res.set('Content-Type', 'application/pdf');
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Error generating PDF', error);
    res.status(500).send('Error generating PDF');
  }
});
