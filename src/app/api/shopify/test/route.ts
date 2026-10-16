import { NextRequest, NextResponse } from "next/server";

// Route de vérification manuelle : confirme que les identifiants Shopify
// sont bien configurés et valides, sans jamais révéler le token. Protégée
// par le même secret que le cron, passé en paramètre d'URL pour un test
// simple depuis le navigateur.
export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get("key");
  if (key !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const domain = process.env.SHOPIFY_STORE_DOMAIN;
  const token = process.env.SHOPIFY_ADMIN_API_TOKEN;

  if (!domain || !token) {
    return NextResponse.json(
      { ok: false, error: "Variables d'environnement Shopify manquantes" },
      { status: 500 }
    );
  }

  try {
    const res = await fetch(`https://${domain}/admin/api/2024-10/shop.json`, {
      headers: { "X-Shopify-Access-Token": token },
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        { ok: false, status: res.status, error: text },
        { status: 502 }
      );
    }

    const data = await res.json();
    return NextResponse.json({
      ok: true,
      shopName: data.shop?.name,
      domain: data.shop?.myshopify_domain,
    });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Erreur inconnue" },
      { status: 500 }
    );
  }
}
