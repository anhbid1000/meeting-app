import { Request } from "express";

export const REFRESH_COOKIE_NAME = "refreshToken";

export const getCookie = (req: Request, name: string) => {
  const cookieHeader = req.headers.cookie;
  if (!cookieHeader) return undefined;

  const cookies = cookieHeader.split(";").map((cookie) => cookie.trim());
  const target = cookies.find((cookie) => cookie.startsWith(`${name}=`));
  if (!target) return undefined;

  return decodeURIComponent(target.slice(name.length + 1));
};
