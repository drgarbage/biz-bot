export const request = async ( url, options = {} ) => {
  const { method = 'GET', headers = {}, body = undefined } = options;

  const response = await fetch(url, {
    method,
    mode: 'cors',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': '7945',
      ...headers
    },
    body: !!body ? JSON.stringify(body) : undefined
  });

  if(!response.ok)
    throw new Error('Network Error');

  const result = await response.json();

  return result;
}