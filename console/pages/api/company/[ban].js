import { request } from "@/lib/api-base";

// https://eip.fia.gov.tw/OAI/api/businessRegistration/91543313
// https://data.gcis.nat.gov.tw/od/data/api/5F64D864-61CB-4D0D-8AD9-492047CC1EA6?$format=json&$filter=Business_Accounting_NO eq 
export default async (req, res) => {
  const {ban : companyBAN} = req.query;
  const rs = await request(`https://eip.fia.gov.tw/OAI/api/businessRegistration/${companyBAN}`);
  res.status(200).json(
    rs.length === 0 ? {} :
    {
      companyBAN,
      companyName: rs.businessNm,
      companyAddress: rs.businessAddress,
      companyAccountingNo: rs.ban
    }
  );
}