export const evenRound = (num, decimalPlaces) => {
  var d = decimalPlaces || 0;
  var m = Math.pow(10, d);
  var n = +(d ? num * m : num).toFixed(8); // Avoid rounding errors
  var i = Math.floor(n), f = n - i;
  var e = 1e-8; // Allow for rounding errors in f
  var r = (f > 0.5 - e && f < 0.5 + e) ?
              ((i % 2 == 0) ? i : i + 1) : Math.round(n);
  return d ? r / m : r;
}

export const calculateInvoice = (invoice) => {
  const total = evenRound(invoice.items.reduce(
    (p,c) => p + (parseFloat(c.price) * parseFloat(c.quantity)), 0));
  const tax = invoice.taxType === 1 ? evenRound(total * 0.05) : 0;
  const amount = total + tax;
  
  return {
    total,
    tax,
    amount
  }
}

export const attachInvoiceCalculation = (invoice) => {
  const { total, tax, amount } = calculateInvoice(invoice);
  return {
    ...invoice,
    total, 
    tax, 
    amount
  }
}