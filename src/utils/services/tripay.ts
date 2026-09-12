import crypto from "crypto";

export const generateSignature = (merchantRef: string, amount: number) => {
  const privateKey = process.env.TRIPAY_PRIVATE_KEY as string;
  const merchantCode = process.env.TRIPAY_MERCHANT_CODE as string;
  const payload = `${merchantCode}${merchantRef}${amount}`;
  return crypto.createHmac("sha256", privateKey).update(payload).digest("hex");
};

export const getPaymentChannels = async () => {
  const apiKey = process.env.TRIPAY_API_KEY as string;
  const apiUrl = process.env.TRIPAY_API_URL as string;

  const response = await fetch(`${apiUrl}merchant/payment-channel`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  });
  return response.json();
};

export const createTransaction = async (data: any) => {
  const apiKey = process.env.TRIPAY_API_KEY as string;
  const apiUrl = process.env.TRIPAY_API_URL as string;
  const signature = generateSignature(data.merchant_ref, data.amount);

  const response = await fetch(`${apiUrl}transaction/create`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ...data,
      signature,
    }),
  });
  return response.json();
};

export const getTransactionDetail = async (reference: string) => {
  const apiKey = process.env.TRIPAY_API_KEY as string;
  const apiUrl = process.env.TRIPAY_API_URL as string;
  const url = new URL(`${apiUrl}transaction/detail`);
  url.searchParams.append("reference", reference);

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  });
  return response.json();
};
