const { WebpayPlus, Options, IntegrationApiKeys, IntegrationCommerceCodes, Environment } = require("transbank-sdk");

const options = new Options(
  IntegrationCommerceCodes.WEBPAY_PLUS,
  IntegrationApiKeys.WEBPAY,
  Environment.Integration
);

exports.handler = async (event) => {
  try {
    // Webpay envía token_ws por POST (y a veces GET si el user refresca)
    const token = (event.queryStringParameters && event.queryStringParameters.token_ws) ||
                  (event.body && new URLSearchParams(event.body).get("token_ws"));

    if (!token) {
      return {
        statusCode: 302,
        headers: { Location: "/pago-error.html" },
      };
    }

    const tx = new WebpayPlus.Transaction(options);
    const result = await tx.commit(token);

    // result contiene status, amount, buy_order, card_detail, etc.
    if (result.status === "AUTHORIZED") {
      // Podrías registrar el pago en una planilla/API propia aquí
      return {
        statusCode: 302,
        headers: { Location: `/pago-exitoso.html?monto=${result.amount}&orden=${result.buy_order}` },
      };
    } else {
      return {
        statusCode: 302,
        headers: { Location: "/pago-error.html" },
      };
    }
  } catch (e) {
    console.error(e);
    return {
      statusCode: 302,
      headers: { Location: "/pago-error.html" },
    };
  }
};
