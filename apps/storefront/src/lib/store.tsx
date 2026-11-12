"use client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  type ReactNode,
} from "react";
import { api, json } from "./api";
import {
  normalizeCart,
  quantity,
  sameLine,
  MAX_QUANTITY,
  type CartLine,
} from "./commerce/cart";
import type { Account, ShopSettings } from "./commerce/types";
import {
  products as seedProducts,
  sellers as seedSellers,
  type Product,
  type Seller,
} from "./mock-data";
export type { CartLine } from "./commerce/cart";
interface StoreShape {
  cart: CartLine[];
  wishlist: string[];
  account: Account | null;
  ready: boolean;
  products: Product[];
  sellers: Seller[];
  settings: ShopSettings | null;
  error: string | null;
  refresh: () => Promise<void>;
  addToCart: (line: Omit<CartLine, "qty"> & { qty?: number }) => void;
  setQty: (productId: string, qty: number, variant?: string) => void;
  removeFromCart: (productId: string, variant?: string) => void;
  clearCart: () => void;
  cartCount: number;
  toggleWishlist: (id: string) => void;
  saveWishlist: (id: string) => void;
  inWishlist: (id: string) => boolean;
  signIn: (account: Account) => void;
  signOut: () => Promise<void>;
}
const StoreContext = createContext<StoreShape | null>(null);
const KEY = "punjabimarts.store.v2";
const AUTH_KEY = "punjabimarts.auth.changed";

function notifyAccountChange() {
  try {
    localStorage.setItem(AUTH_KEY, crypto.randomUUID());
  } catch {
    /* private browsing */
  }
}
export function StoreProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartLine[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [account, setAccount] = useState<Account | null>(null);
  const [ready, setReady] = useState(false);
  const [products, setProducts] = useState<Product[]>(seedProducts);
  const [sellers, setSellers] = useState<Seller[]>(seedSellers);
  const [settings, setSettings] = useState<ShopSettings | null>(null);
  const [error, setError] = useState<string | null>(null);
  const accountId = useRef<number | null>(null);
  const requestVersion = useRef(0);
  async function refresh() {
    const version = ++requestVersion.current;
    try {
      const [session, catalog] = await Promise.all([
        api<{ user: Account | null; wishlist: string[] }>("/session"),
        api<{ products: Product[]; sellers: Seller[]; settings: ShopSettings }>(
          "/catalog",
        ),
      ]);
      if (version !== requestVersion.current) return;
      const previousAccount = accountId.current;
      accountId.current = session.user?.id ?? null;
      setAccount(session.user);
      if (session.user) setWishlist(session.wishlist);
      else if (previousAccount !== null) setWishlist([]);
      setProducts(catalog.products);
      setSellers(catalog.sellers);
      setSettings(catalog.settings);
      setError(null);
    } catch {
      if (version !== requestVersion.current) return;
      setError(
        "The shop service is unavailable. Please retry before placing an order.",
      );
    }
  }
  useEffect(() => {
    let active = true;
    Promise.resolve().then(async () => {
      if (!active) return;
      try {
        const state = JSON.parse(
          localStorage.getItem(KEY) ??
            localStorage.getItem("punjabimarts.store.v1") ??
            "{}",
        );
        setCart(normalizeCart(state.cart));
        setWishlist(
          state.wishlistOwner == null && Array.isArray(state.wishlist)
            ? state.wishlist.filter((id: unknown) => typeof id === "string")
            : [],
        );
      } catch {
        /* corrupt storage is reset */
      }
      await refresh();
      if (active) setReady(true);
    });
    const sync = (e: StorageEvent) => {
      if (e.key === AUTH_KEY) {
        void refresh();
        return;
      }
      if (e.key === KEY) {
        try {
          const s = JSON.parse(e.newValue ?? "{}");
          setCart(normalizeCart(s.cart));
          if (
            (s.wishlistOwner ?? null) === accountId.current &&
            Array.isArray(s.wishlist)
          )
            setWishlist(
              s.wishlist.filter((id: unknown) => typeof id === "string"),
            );
        } catch {
          /* ignore corrupt external writes */
        }
      }
    };
    window.addEventListener("storage", sync);
    return () => {
      active = false;
      window.removeEventListener("storage", sync);
    };
  }, []);
  useEffect(() => {
    if (ready) {
      try {
        localStorage.setItem(
          KEY,
          JSON.stringify({
            cart,
            wishlist,
            wishlistOwner: account?.id ?? null,
          }),
        );
      } catch {
        /* browser privacy mode */
      }
    }
  }, [cart, wishlist, account, ready]);
  function updateWishlist(id: string, saved: boolean) {
    setWishlist((prev) =>
      saved ? [...new Set([...prev, id])] : prev.filter((p) => p !== id),
    );
    if (account)
      void api("/wishlist", json("POST", { productId: id, saved })).catch(
        (e) => {
          setError(e.message);
          void refresh();
        },
      );
  }
  return (
    <StoreContext.Provider
      value={{
        cart,
        wishlist,
        account,
        ready,
        products,
        sellers,
        settings,
        error,
        refresh,
        cartCount: cart.reduce((n, l) => n + l.qty, 0),
        addToCart: (line) =>
          setCart((prev) => {
            const p = products.find((p) => p.id === line.productId);
            if (!p?.inStock || (p.requiresVariant && !line.variant))
              return prev;
            const existing = prev.find((l) =>
              sameLine(l, line.productId, line.variant),
            );
            const qty = Math.min(
              MAX_QUANTITY,
              existing ? existing.qty + (line.qty ?? 1) : (line.qty ?? 1),
            );
            return existing
              ? quantity(prev, line.productId, qty, line.variant)
              : normalizeCart([...prev, { ...line, qty }]);
          }),
        setQty: (id, qty, variant) =>
          setCart((prev) => quantity(prev, id, qty, variant)),
        removeFromCart: (id, variant) =>
          setCart((prev) => quantity(prev, id, 0, variant)),
        clearCart: () => setCart([]),
        toggleWishlist: (id) => updateWishlist(id, !wishlist.includes(id)),
        saveWishlist: (id) => updateWishlist(id, true),
        inWishlist: (id) => wishlist.includes(id),
        signIn: (user) => {
          requestVersion.current++;
          accountId.current = user.id;
          setAccount(user);
          setWishlist([]);
          notifyAccountChange();
          void refresh();
        },
        signOut: async () => {
          requestVersion.current++;
          await api("/logout", json("POST", {}));
          requestVersion.current++;
          accountId.current = null;
          setAccount(null);
          setWishlist([]);
          notifyAccountChange();
        },
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}
export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("StoreProvider missing");
  return ctx;
}
