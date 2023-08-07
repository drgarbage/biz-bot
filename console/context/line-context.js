import { createContext, useState, useContext, useEffect } from "react";
import { register } from "@/lib/api-company";
import liff from "@line/liff";

const Initial = {
  profile: null,
}

export const LineContext = createContext(Initial);

export const WithLineContext = (props) => {
  // const router = useRouter();
  // const {page} = router.query;
  const [state, setState] = useState({...Initial});

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
    <LineContext.Provider value={{...state, setProfile: setState}}>
      {props.children}
    </LineContext.Provider>
  );
};

export const useLineContext = () => useContext(LineContext);