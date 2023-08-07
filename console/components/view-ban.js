import { companyInfo } from "@/lib/api-company";
import { InputAdornment, TextField } from "@mui/material";
import { useEffect, useState } from "react"

export default (props) => {
  const [company, setCompany] = useState();
  const { value } = props;
  useEffect(()=>{
    if(!value || value.length < 8) return;
    companyInfo(value)
      .then(setCompany)
      .catch(console.error);
  }, [value, setCompany]);
  return (
    <TextField 
      {...props} 
      InputProps={{
        endAdornment: company?.companyName && 
          <InputAdornment position="end">{company?.companyName}</InputAdornment>
      }}
    />
  );
}