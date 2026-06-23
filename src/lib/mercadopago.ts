const MP_API_BASE = "https://api.mercadopago.com";

function getAccessToken(): string {
  const token = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!token) throw new Error("MERCADOPAGO_ACCESS_TOKEN no configurado");
  return token;
}

interface CreatePreferenceParams {
  title: string;
  description: string;
  unitPrice: number;
  currencyId: string;
  externalReference: string;
  backUrls: {
    success: string;
    failure: string;
    pending: string;
  };
  notificationUrl: string;
}

interface PreferenceResponse {
  id: string;
  init_point: string;
  sandbox_init_point: string;
}

export async function createPreference(params: CreatePreferenceParams): Promise<PreferenceResponse> {
  const token = getAccessToken();

  const body = {
    items: [
      {
        title: params.title,
        description: params.description,
        quantity: 1,
        unit_price: params.unitPrice,
        currency_id: params.currencyId,
      },
    ],
    external_reference: params.externalReference,
    back_urls: {
      success: params.backUrls.success,
      failure: params.backUrls.failure,
      pending: params.backUrls.pending,
    },
    notification_url: params.notificationUrl,
  };

  const res = await fetch(`${MP_API_BASE}/checkout/preferences`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Mercado Pago error: ${res.status} ${err}`);
  }

  return res.json();
}

export async function getPayment(paymentId: string) {
  const token = getAccessToken();

  const res = await fetch(`${MP_API_BASE}/v1/payments/${paymentId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Mercado Pago error: ${res.status} ${err}`);
  }

  return res.json();
}
