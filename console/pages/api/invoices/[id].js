import * as pdf from 'pdf-creator-node';
import * as fs from 'fs';
import path from 'path';
import { invoice as fetchInvoice } from '@/lib/api-company';
import moment from 'moment';

const options = {
  format: "A5",
  orientation: "landscape",
  border: "5mm",
};

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

export default async (req, res) => {
  try{
    const {id : invoiceId} = req.query;
    const filename = `${invoiceId}.pdf`;
    const invoice = await fetchInvoice(invoiceId);
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
    const templatePath = path.join(process.cwd(), '/public/assets/template.html');
    const html = fs.readFileSync(templatePath, "utf8");
    const document = { html, data, path: `./public/pdfs/${filename}`, type: "buffer" };
    const result = await pdf.create(document, options);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename=${filename}`);

    res.status(200).send(result);
  }catch(err){
    console.error(err);
    res.status(500).send(err.message);
  }
}