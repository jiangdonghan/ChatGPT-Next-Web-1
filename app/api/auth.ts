import { NextRequest } from "next/server";
import { getServerSideConfig } from "../config/server";
import md5 from "spark-md5";
import { ACCESS_CODE_PREFIX } from "../constant";
import { fetchAccessCodeData } from "@/app/api/contentful";

function getIP(req: NextRequest) {
  let ip = req.ip ?? req.headers.get("x-real-ip");
  const forwardedFor = req.headers.get("x-forwarded-for");

  if (!ip && forwardedFor) {
    ip = forwardedFor.split(",").at(0) ?? "";
  }

  return ip;
}

export function parseApiKey(bearToken: string) {
  const token = bearToken.trim().replaceAll("Bearer ", "").trim();
  const isOpenAiKey = !token.startsWith(ACCESS_CODE_PREFIX);

  return {
    accessCode: isOpenAiKey ? "" : token.slice(ACCESS_CODE_PREFIX.length),
    apiKey: isOpenAiKey ? token : "",
  };
}

export const checkAccessCodeValid = (accessCode: any) => {
  if (accessCode && accessCode.usageType === "count") {
    return accessCode.countLeft > 0;
  }
  if (accessCode && accessCode.usageType === "time") {
    const now = new Date();
    const expiredAt = new Date(accessCode.expiredAt);
    if (now.getTime() > expiredAt.getTime()) {
      return false;
    }
  }
  return true;
};

export async function auth(req: NextRequest) {
  const authToken = req.headers.get("Authorization") ?? "";

  // check if it is openai api key or user token
  const { accessCode, apiKey: token } = parseApiKey(authToken);

  const hashedCode = md5.hash(accessCode ?? "").trim();

  const serverConfig = getServerSideConfig();
  console.log("[Auth] allowed hashed codes: ", [...serverConfig.codes]);
  console.log("[Auth] got access code:", accessCode);
  console.log("[Auth] hashed access code:", hashedCode);
  console.log("[User IP] ", getIP(req));
  console.log("[Time] ", new Date().toLocaleString());

  if (serverConfig.needCode && !serverConfig.codes.has(hashedCode) && !token) {
    let resData = { items: [] };
    try {
      resData = await fetchAccessCodeData(accessCode);
    } catch (e) {
      console.log(e);
      resData = { items: [] };
    }
    const accessCodes: any = resData.items;
    console.log("hasAccessFromServer", accessCodes);
    if (accessCodes.length === 0) {
      console.log("[Auth] access code not found in server");
      return {
        error: true,
        msg: !accessCode ? "empty access code" : "wrong access code",
      };
    } else {
      if (!checkAccessCodeValid(accessCodes[0]?.fields)) {
        return {
          error: true,
          msg: "wrong access code",
        };
      }
    }
  }

  // if user does not provide an api key, inject system api key
  if (!token) {
    const apiKey = serverConfig.apiKey;
    if (apiKey) {
      console.log("[Auth] use system api key");
      req.headers.set("Authorization", `Bearer ${apiKey}`);
    } else {
      console.log("[Auth] admin did not provide an api key");
    }
  } else {
    console.log("[Auth] use user api key");
  }

  return {
    error: false,
  };
}
