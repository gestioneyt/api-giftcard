import aws4 from "aws4";

export async function signAndFetch({
  baseUrl,
  region,
  service = "AGCODService",
  operation,
  bodyJson,
  accessKeyId,
  secretAccessKey,
}) {
  const url = new URL(baseUrl);
  const host = url.host;
  const path = `/${operation}`;
  const body = JSON.stringify(bodyJson);

  const opts = {
    host,
    path,
    method: "POST",
    service,
    region,
    headers: {
      "content-type": "application/json",
      "accept": "application/json",
      "x-amz-target": `com.amazonaws.agcod.AGCODService.${operation}`
    },
    body
  };

  aws4.sign(opts, { accessKeyId, secretAccessKey });

  const res = await fetch(`${baseUrl}${path}`, {
    method: "POST",
    headers: opts.headers,
    body
  });

  const text = await res.text();
  let json;
  try { json = JSON.parse(text); } catch { json = { raw: text }; }

  if (!res.ok) {
    throw new Error(`AGCOD ${operation} HTTP ${res.status}: ${text}`);
  }
  return json;
}
