import { request } from "@/lib/api-base";
export default async (req, res) => {
  const {ban : companyBAN} = req.query;
  const rs = await request(`https://data.gcis.nat.gov.tw/od/data/api/5F64D864-61CB-4D0D-8AD9-492047CC1EA6?$format=json&$filter=Business_Accounting_NO eq ${companyBAN}`);
  res.status(200).json(
    rs.length === 0 ? {} :
    {
      companyBAN,
      companyName: rs[0]['Company_Name'],
      companyAddress: rs[0]['Company_Location'],
      companyAccountingNo: rs[0]['Business_Accounting_NO']
    }
  );
}