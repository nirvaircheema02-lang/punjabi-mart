"use client";
import { useState } from "react";
import { api, json } from "@/lib/api";
import { categories } from "@/lib/mock-data";
import type { Shop, ManagedProduct } from "@/lib/commerce/management";
import { Field, Notice } from "./Forms";
export function ProductEditor({
  product,
  shops,
  admin,
  close,
  saved,
}: {
  product?: ManagedProduct;
  shops: Shop[];
  admin: boolean;
  close: () => void;
  saved: () => Promise<void>;
}) {
  const [image, setImage] = useState(product?.image ?? "");
  const [primaryOptions, setPrimaryOptions] = useState(
    product?.variant?.options.join(", ") ?? "",
  );
  const [stockInputs, setStockInputs] = useState<Record<string, number>>(
    product?.variantStocks ?? {},
  );
  const [secondaryOptions, setSecondaryOptions] = useState(
    product?.variant?.secondary?.options.join(", ") ?? "",
  );
  const primary = primaryOptions
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  const secondary = secondaryOptions
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  const variantKeys = primary.flatMap((value) =>
    secondary.length
      ? secondary.map((second) => `${value} · ${second}`)
      : [value],
  );

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function upload(file?: File) {
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      const body = new FormData();
      body.set("image", file);
      setImage(
        (
          await api<{ image: string }>("/manage/upload", {
            method: "POST",
            body,
          })
        ).image,
      );
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="pm-management-card">
      <h2>{product ? "Edit product" : "Add product"}</h2>
      <Notice error>{error}</Notice>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          setError("");
          const f = new FormData(e.currentTarget);
          const options = String(f.get("options") ?? "")
            .split(",")
            .map((v) => v.trim())
            .filter(Boolean);
          const secondary = String(f.get("secondaryOptions") ?? "")
            .split(",")
            .map((v) => v.trim())
            .filter(Boolean);
          try {
            await api(
              `/manage/products${product ? `/${product.id}` : ""}`,
              json(product ? "PATCH" : "POST", {
                title: f.get("title"),
                category: f.get("category"),
                price: Number(f.get("price")),
                mrp: Number(f.get("mrp")),
                stock: Number(f.get("stock")),
                description: f.get("description"),
                status: f.get("status"),
                sellerId: admin ? f.get("sellerId") || null : product?.sellerId,
                isDemo: admin
                  ? f.get("isDemo") === "on"
                  : (product?.isDemo ?? false),
                commission: admin
                  ? f.get("commission") === ""
                    ? null
                    : Number(f.get("commission"))
                  : undefined,
                ...(image ? { image } : {}),
                variantStocks: options.length
                  ? Object.fromEntries(
                      variantKeys.map((key) => [
                        key,
                        Number(f.get(`stock:${key}`) ?? 0),
                      ]),
                    )
                  : null,
                variant: options.length
                  ? {
                      label: f.get("variantLabel"),
                      options,
                      outOfStock:
                        product?.variant?.outOfStock?.filter((v) =>
                          options.includes(v),
                        ) ?? [],
                      ...(secondary.length
                        ? {
                            secondary: {
                              label: f.get("secondaryLabel"),
                              options: secondary,
                            },
                          }
                        : {}),
                    }
                  : null,
              }),
            );
            await saved();
          } catch (e) {
            setError((e as Error).message);
          } finally {
            setBusy(false);
          }
        }}
      >
        <div className="pm-form-grid">
          <Field
            label="Product name"
            name="title"
            required
            maxLength={180}
            defaultValue={product?.title}
          />
          <label>
            Category
            <select name="category" defaultValue={product?.category}>
              {categories.map((c) => (
                <option value={c.slug} key={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          {admin && (
            <label>
              Product owner
              <select name="sellerId" defaultValue={product?.sellerId ?? ""}>
                <option value="">PunjabiMarts — my own product</option>
                {shops.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.status})
                  </option>
                ))}
              </select>
            </label>
          )}
          <Field
            label="Selling price ₹"
            name="price"
            type="number"
            min="1"
            step="0.01"
            required
            defaultValue={product?.price}
          />
          <Field
            label="MRP ₹"
            name="mrp"
            type="number"
            min="1"
            step="0.01"
            required
            defaultValue={product?.mrp}
          />
          <Field
            label={
              variantKeys.length
                ? "Total stock (option quantities are set below)"
                : "Available stock"
            }
            name="stock"
            type="number"
            min="0"
            required
            value={
              variantKeys.length
                ? variantKeys.reduce(
                    (sum, key, index) =>
                      sum +
                      (stockInputs[key] ??
                        (index === 0 ? (product?.stock ?? 0) : 0)),
                    0,
                  )
                : undefined
            }
            defaultValue={
              variantKeys.length ? undefined : (product?.stock ?? 0)
            }
            readOnly={variantKeys.length > 0}
          />
          <label>
            Status
            <select name="status" defaultValue={product?.status ?? "draft"}>
              {(admin
                ? ["draft", "pending", "active", "archived"]
                : ["pending", "archived"]
              ).map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>
          </label>
          {admin && (
            <Field
              label="Commission % (blank inherits; own products always 0)"
              name="commission"
              type="number"
              min="0"
              max="100"
              step="0.01"
              defaultValue={product?.commission ?? ""}
            />
          )}
          <Field
            label="Product photo (JPG, PNG, WebP; max 5 MB)"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            disabled={busy}
            onChange={(e) => void upload(e.target.files?.[0])}
          />
        </div>
        {image && <p>Uploaded photo ready.</p>}
        <label>
          Description
          <textarea
            name="description"
            rows={3}
            defaultValue={product?.description}
          />
        </label>
        <fieldset>
          <legend>Options (leave empty for products without variants)</legend>
          <div className="pm-form-grid">
            <Field
              label="Option label, e.g. Size"
              name="variantLabel"
              defaultValue={product?.variant?.label}
            />
            <Field
              label="Options separated by commas"
              name="options"
              value={primaryOptions}
              onChange={(event) => setPrimaryOptions(event.target.value)}
            />
            <Field
              label="Second label, e.g. Colour"
              name="secondaryLabel"
              defaultValue={product?.variant?.secondary?.label}
            />
            <Field
              label="Second options separated by commas"
              name="secondaryOptions"
              value={secondaryOptions}
              onChange={(event) => setSecondaryOptions(event.target.value)}
            />
          </div>
          {variantKeys.length > 0 && (
            <div className="pm-form-grid" aria-label="Stock for each option">
              {variantKeys.map((key, index) => (
                <Field
                  key={key}
                  label={`${key} available`}
                  name={`stock:${key}`}
                  type="number"
                  min={0}
                  max={1000000}
                  required
                  value={
                    stockInputs[key] ??
                    (index === 0 ? (product?.stock ?? 0) : 0)
                  }
                  onChange={(event) =>
                    setStockInputs((current) => ({
                      ...current,
                      [key]: Number(event.target.value),
                    }))
                  }
                />
              ))}
            </div>
          )}
        </fieldset>
        {admin && (
          <label>
            <input
              type="checkbox"
              name="isDemo"
              defaultChecked={product?.isDemo ?? true}
            />{" "}
            Demo product (kept separate from live inventory)
          </label>
        )}
        {!admin && <p>Product changes go to the owner for approval.</p>}
        <div className="pm-management-toolbar">
          <button className="pm-btn pm-btn--primary" disabled={busy}>
            {busy ? "Saving…" : "Save product"}
          </button>
          <button
            type="button"
            className="pm-btn"
            disabled={busy}
            onClick={close}
          >
            Close
          </button>
        </div>
      </form>
    </section>
  );
}
