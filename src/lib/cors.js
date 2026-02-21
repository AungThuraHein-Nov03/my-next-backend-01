// List of allowed origins for both local development and production
const allowedOrigins = [
  "http://localhost:5173",
  "https://my-01-server.eastasia.cloudapp.azure.com"
];

function getCorsHeaders(req) {
  // Get the origin from the request headers
  const origin = req.headers.get('origin') || req.headers.get('Origin');
  
  const headers = {
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400"
  };
  
  // Set the origin if it's in our allowed list
  if (origin && allowedOrigins.includes(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
  }
  
  return headers;
}

// Legacy export for backward compatibility
let corsHeaders = {
  "Access-Control-Allow-Credentials": "true",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Max-Age": "86400",
  "Access-Control-Allow-Origin": "http://localhost:5173/",
  "Access-Control-Allow-Origin": "https://my-01-server.eastasia.cloudapp.azure.com"
};

export default corsHeaders;
export { getCorsHeaders };
