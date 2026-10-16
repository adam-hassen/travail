// Connexion à l'API Admin de Shopify. Les identifiants viennent des
// variables d'environnement SHOPIFY_STORE_DOMAIN et SHOPIFY_ADMIN_API_TOKEN
// (configurées dans Vercel) — jamais écrits en dur ici.

const API_VERSION = "2024-10";

function shopifyConfigured() {
  return Boolean(process.env.SHOPIFY_STORE_DOMAIN && process.env.SHOPIFY_ADMIN_API_TOKEN);
}

function shopifyFetch(path: string, options: RequestInit = {}) {
  const domain = process.env.SHOPIFY_STORE_DOMAIN;
  const token = process.env.SHOPIFY_ADMIN_API_TOKEN;
  if (!domain || !token) {
    throw new Error("Shopify n'est pas configuré (variables d'environnement manquantes)");
  }

  return fetch(`https://${domain}/admin/api/${API_VERSION}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": token,
      ...(options.headers ?? {}),
    },
  });
}

// La couverture est stockée en data URL (base64) côté back-office —
// Shopify accepte directement une image encodée en base64 via "attachment".
function coverAsAttachment(coverUrl: string | null) {
  if (!coverUrl || !coverUrl.startsWith("data:")) return null;
  const base64 = coverUrl.split(",")[1];
  return base64 ? { attachment: base64, filename: "couverture.jpg" } : null;
}

type ShopifyBook = {
  title: string;
  description: string | null;
  price: string;
  coverUrl: string | null;
  shopifyProductId: string | null;
};

// Crée ou met à jour le produit Shopify correspondant à un livre.
// Renvoie l'identifiant du produit Shopify (à sauvegarder sur le livre).
export async function pushBookToShopify(book: ShopifyBook): Promise<string> {
  const image = coverAsAttachment(book.coverUrl);

  const payload = {
    product: {
      title: book.title,
      body_html: book.description ?? "",
      vendor: "L'Atelier",
      product_type: "Livre",
      status: "active",
      variants: [{ price: book.price }],
      ...(image ? { images: [image] } : {}),
    },
  };

  const isUpdate = Boolean(book.shopifyProductId);
  const res = await shopifyFetch(
    isUpdate ? `/products/${book.shopifyProductId}.json` : `/products.json`,
    {
      method: isUpdate ? "PUT" : "POST",
      body: JSON.stringify(payload),
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Shopify a refusé la requête (${res.status}) : ${text}`);
  }

  const data = await res.json();
  return String(data.product.id);
}

export { shopifyConfigured };
