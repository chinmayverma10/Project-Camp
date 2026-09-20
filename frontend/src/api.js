const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api/v1";

const request = async(path,options = {}) => {
  const accessToken = localStorage.getItem("accessToken");
  const headers = {...options.headers};

  if(accessToken){
    headers.Authorization = `Bearer ${accessToken}`;
  }

  if(!(options.body instanceof FormData)){
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(`${apiBaseUrl}${path}`,{
    ...options,
    headers,
    credentials: "include"
  });

  const result = await response.json().catch(() => ({}));
  if(!response.ok){
    throw new Error(result.message || "Something went wrong")
  }

  return result.data;
}

export {request};
