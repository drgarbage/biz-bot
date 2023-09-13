import { companyInfo } from "@/lib/api-company";
import { Box } from "@mui/material";
import { useEffect, useState } from "react"

export default (props) => {
  const [company, setCompany] = useState();
  const { companyBAN } = props;
  useEffect(()=>{
    if(!companyBAN || companyBAN.length < 8) return;
    companyInfo(companyBAN)
      .then(setCompany)
      .catch(console.error);
  }, [companyBAN, setCompany]);
  return (
    <Box>
      <Box sx={{fontSize: '80%'}}>{companyBAN}</Box>
      <Box sx={{fontSize: '120%'}}>{company?.companyName}</Box>
      <Box sx={{fontSize: '70%'}}>{company?.companyAddress}</Box>
      <Box sx={{fontSize: '70%'}}>{company?.companyPhoneNumber}</Box>
    </Box>
  );
}