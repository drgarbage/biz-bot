import { createContext, useState, useContext, useEffect } from "react";
import { register, updateRegisteration } from "@/lib/api-company";
import liff from "@line/liff";

const Initial = {
  profile: null,
}

export const LineContext = createContext(Initial);

export const WithLineContext = (props) => {
  // const router = useRouter();
  // const {page} = router.query;
  const [state, setState] = useState({...Initial});

  const setDefaultCompany = async (companyBAN) => {
    const { profile } = state;
    const { companies } = profile;

    const foundIndex = companies.indexOf(companyBAN);
  
    if(foundIndex < 0) return;
  
    companies.splice(foundIndex, 1);
  
    await updateRegisteration({...profile, companies: [companyBAN, ...companies] });

    setState(s => ({...s, profile: {...profile, companies: [companyBAN, ...companies] }}));
  }

  const addCompany = async (companyBAN) => {
    const { profile } = state;
    const { companies : oldCompanies } = profile;
    
    if(oldCompanies.indexOf(companyBAN) >= 0) return;
  
    const companies = [...oldCompanies, companyBAN];
  
    await updateRegisteration({...profile, companies });

    setState(s => ({...s, profile: {...profile, companies }}));
  }

  const removeCompany = async (companyBAN) => {
    const { profile } = state;
    const { companies } = profile;

    const foundIndex = companies.indexOf(companyBAN);
  
    if(foundIndex < 0) return;
  
    companies.splice(foundIndex, 1);
  
    await updateRegisteration({...profile, companies });

    setState(s => ({...s, profile: {...profile, companies }}));
  }

  const updateCompany = async (original, changed) => {
    const { profile } = state;
    const { companies } = profile;

    const foundIndex = companies.indexOf(original);
  
    if(foundIndex < 0) return;

    const newCompanies = [...companies];

    newCompanies[foundIndex] = changed;
  
    await updateRegisteration({...profile, companies: newCompanies });

    setState(s => ({...s, profile: {...profile, companies: newCompanies }}));

  }

  useEffect(() => {

    (async () => {
      await liff.init({
        liffId: '2000292758-DAkm7XvB',
        withLoginOnExternalBrowser: true, 
      });
      const profile = await liff.getProfile();
      const lineUserConfig = await register(profile);
      setState(s => ({...s, profile: lineUserConfig}));
    })();

  }, [setState]);

  return (
    <LineContext.Provider value={{
      ...state, 
      setProfile: setState, 
      addCompany, 
      removeCompany,
      setDefaultCompany,
      updateCompany
    }}>
      {props.children}
    </LineContext.Provider>
  );
};

export const useLineContext = () => useContext(LineContext);