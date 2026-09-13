const ZARINPAL_BASE_URL = "https://sandbox.zarinpal.com";

const ZARINPAL_REQUEST_URL = `${ZARINPAL_BASE_URL}/pg/v4/payment/request.json`;
const ZARINPAL_VERIFY_URL = `${ZARINPAL_BASE_URL}/pg/v4/payment/verify.json`;
const ZARINPAL_GATEWAY_URL = `${ZARINPAL_BASE_URL}/pg/StartPay/`;

const MERCHANT_ID = process.env.ZARINPAL_MERCHANT_ID;

if (!MERCHANT_ID) {
  throw new Error("❌ ZARINPAL_MERCHANT_ID is not defined in .env");
}

export interface ZarinPalRequestPayload {
  amount: number;
  description: string;
  callbackUrl: string;
  email?: string;
  mobile?: string;
  orderId?: string;
}

export interface ZarinPalRequestResult {
  success: boolean;
  authority?: string;
  paymentUrl?: string;
  fee?: number;
  feeType?: string;
  error?: string;
  errorCode?: number;
}

export interface ZarinPalVerifyPayload {
  authority: string;
  amount: number;
}

export interface ZarinPalVerifyResult {
  success: boolean;
  alreadyVerified?: boolean;
  refId?: string;
  cardPan?: string;
  cardHash?: string;
  feeType?: string;
  fee?: number;
  error?: string;
  errorCode?: number;
}

// [UTIL] Map ZarinPal error codes to localization keys
const getErrorMessageKey = (code: number): string => {
  const errors: Record<number, string> = {
    [-9]: "zarinpal.errors.validation",
    [-10]: "zarinpal.errors.invalidMerchant",
    [-11]: "zarinpal.errors.inactiveMerchant",
    [-12]: "zarinpal.errors.tooManyRequests",
    [-14]: "zarinpal.errors.invalidCallback",
    [-41]: "zarinpal.errors.maxAmountExceeded",
    [-50]: "zarinpal.errors.amountMismatch",
    [-51]: "zarinpal.errors.failed",
    [-52]: "zarinpal.errors.unexpected",
    [-53]: "zarinpal.errors.merchantMismatch",
    [-54]: "zarinpal.errors.invalidAuthority",
    [-55]: "zarinpal.errors.transactionNotFound",
  };

  return errors[code] || "zarinpal.errors.unknown";
};

export const requestPayment = async (
  payload: ZarinPalRequestPayload,
): Promise<ZarinPalRequestResult> => {
  try {
    const response = await fetch(ZARINPAL_REQUEST_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        merchant_id: MERCHANT_ID,
        amount: payload.amount,
        currency: "IRR",
        description: payload.description,
        callback_url: payload.callbackUrl,
        metadata: {
          email: payload.email,
          mobile: payload.mobile,
          order_id: payload.orderId,
        },
      }),
    });

    if (!response.ok) {
      return {
        success: false,
        error: "zarinpal.errors.httpError",
      };
    }
    const result = await response.json();
    if (result.data?.code === 100) {
      return {
        success: true,
        authority: result.data.authority,
        paymentUrl: `${ZARINPAL_GATEWAY_URL}${result.data.authority}`,
        fee: result.data.fee,
        feeType: result.data.fee_type,
      };
    }

    const errorCode = result.errors?.code || result.data?.code || -999;
    return {
      success: false,
      error: getErrorMessageKey(errorCode),
      errorCode,
    };
  } catch (error) {
    console.error("❌ ZarinPal request error:", error);
    return {
      success: false,
      error: "zarinpal.errors.connectionError",
    };
  }
};

export const verifyPayment = async (
  payload: ZarinPalVerifyPayload,
): Promise<ZarinPalVerifyResult> => {
  try {
    const response = await fetch(ZARINPAL_VERIFY_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        merchant_id: MERCHANT_ID,
        authority: payload.authority,
        amount: payload.amount,
      }),
    });

    if (!response.ok) {
      return {
        success: false,
        error: "zarinpal.errors.httpError",
      };
    }
    const result = await response.json();

    if (result.data?.code === 100) {
      return {
        success: true,
        alreadyVerified: false,
        refId: String(result.data.ref_id),
        cardPan: result.data.card_pan,
        cardHash: result.data.card_hash,
        feeType: result.data.fee_type,
        fee: result.data.fee,
      };
    }

    if (result.data?.code === 101) {
      return {
        success: true,
        alreadyVerified: true,
        refId: String(result.data.ref_id),
        cardPan: result.data.card_pan,
        feeType: result.data.fee_type,
        fee: result.data.fee,
      };
    }

    const errorCode = result.errors?.code || result.data?.code || -999;
    return {
      success: false,
      error: getErrorMessageKey(errorCode),
      errorCode,
    };
  } catch (error) {
    console.error("❌ ZarinPal verify error:", error);
    return {
      success: false,
      error: "zarinpal.errors.verificationError",
    };
  }
};
