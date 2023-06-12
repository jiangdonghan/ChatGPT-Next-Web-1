const BASE_URL = "https://cdn.contentful.com";

const CONTENTFUL_SPACE_ID = process.env.CONTENTFUL_SPACE_ID;
const CONTENTFUL_ACCESS_TOKEN = process.env.CONTENTFUL_ACCESS_TOKEN;
export async function fetchAccessCodeData(accessCode: string) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, 10 * 60 * 1000);

  const fetchUrl = `${BASE_URL}/spaces/${CONTENTFUL_SPACE_ID}/environments/master/entries?access_token=${CONTENTFUL_ACCESS_TOKEN}&content_type=gpt&fields.accessCode=${accessCode}`;

  console.log("contentful fetchUrl", fetchUrl);
  const fetchOptions: RequestInit = {
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store",
    method: "GET",
    signal: controller.signal,
  };

  const response = await fetch(fetchUrl, fetchOptions);
  const data = await response.json();
  clearTimeout(timeoutId);
  return data;
}
