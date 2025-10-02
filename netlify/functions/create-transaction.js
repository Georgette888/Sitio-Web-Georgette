const { WebpayPlus, Options, IntegrationApiKeys, IntegrationCommerceCodes, Environment } = require("transbank-sdk");

// Configuración de PRUEBAS
const options = new Options(
  IntegrationCommerceCodes.WEBPAY_PLUS, // 597055555532
  IntegrationApiKeys.WEBPAY,
  Environment.Integration
);

// Cambia esto por tu dominio real en producción
const SITE_URL = process.env.SITE_URL || "https://georgettemora.cl";

exports.handler = async (event) => {
  try {
    // Puedes leer monto y descripción desde el body si quieres
    const { amount = 3500 } = JSON.parse(event.body || "{}");

    const buyOrder = "GM-" + Date.now();
    const sessionId = "sess-" + Date.now();
    const returnUrl = `${SITE_URL}/api/commit-transaction`; // Webpay volverá aquí con token_ws

    const tx = new WebpayPlus.Transaction(options);
    const resp = await tx.create(buyOrder, sessionId, amount, returnUrl);

    // Resp trae { token, url }
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: resp.token, url: resp.url })
    };
  } catch (e) {
    console.error(e);
    return { statusCode: 500, body: JSON.stringify({ error: "No se pudo crear la transacción" }) };
  }
};
