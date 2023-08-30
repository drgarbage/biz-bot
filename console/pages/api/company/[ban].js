import { nativeFetchCompanyInfo } from "@/lib/api-company";

export default async (req, res) => {
  const {ban : companyBAN} = req.query;
  const result = await nativeFetchCompanyInfo(companyBAN);
  res.status(200).json(result);
}