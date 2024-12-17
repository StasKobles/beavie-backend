import * as crypto from 'crypto';

function validateInitData(initData: string, botToken: string): boolean {
  const urlSearchParams = new URLSearchParams(initData);
  const params = Object.fromEntries(urlSearchParams.entries());

  const hash = params.hash;
  delete params.hash;

  const checkString = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join('\n');

  const secretKey = crypto.createHash('sha256').update(botToken).digest();
  const hmac = crypto
    .createHmac('sha256', secretKey)
    .update(checkString)
    .digest('hex');

  return hmac === hash;
}

export default validateInitData;
