"use strict";

/* ==========================================================================
   Data
   ========================================================================== */
const PRODUCTS = [
  {
    id: 1,
    name: "Kelp Mug",
    type: "Mug",
    price: 28,
    color: "#2f7a62",
    glaze: "Seagrass green",
  },
  {
    id: 2,
    name: "Low Tide Bowl",
    type: "Bowl",
    price: 34,
    color: "#c9b79c",
    glaze: "Wet sand",
  },
  {
    id: 3,
    name: "Harbor Vase",
    type: "Vase",
    price: 56,
    color: "#243b8f",
    glaze: "Deep harbor blue",
  },
  {
    id: 4,
    name: "Spray Mug",
    type: "Mug",
    price: 28,
    color: "#8fc3d9",
    glaze: "Sea spray",
  },
  {
    id: 5,
    name: "Barnacle Bowl",
    type: "Bowl",
    price: 38,
    color: "#6b7280",
    glaze: "Barnacle gray",
  },
  {
    id: 6,
    name: "Coral Vase",
    type: "Vase",
    price: 62,
    color: "#e0705a",
    glaze: "Coral reef",
  },
  {
    id: 7,
    name: "Foam Mug",
    type: "Mug",
    price: 26,
    color: "#f1f5f4",
    glaze: "Sea foam",
  },
  {
    id: 8,
    name: "Dusk Bowl",
    type: "Bowl",
    price: 42,
    color: "#5a3d8a",
    glaze: "Dusk violet",
  },
];

const CATEGORIES = ["All", "Mug", "Bowl", "Vase"];
const STORAGE_KEY = "tidepool-cart";

/* Product illustrations, drawn as SVG and tinted with each glaze color. */
const SHAPES = {
  Mug: (c) => `
    <svg viewBox="0 0 120 120" aria-hidden="true">
      <path
        d="M92 44h8a14 14 0 0 1 0 32h-8"
        fill="none"
        stroke="${c}"
        stroke-width="8"
        stroke-linecap="round"
      />
      <rect x="22" y="28" width="72" height="68" rx="12" fill="${c}"/>
      <rect
        x="22" y="28" width="72" height="10" rx="5"
        fill="#fff" opacity=".25"
      />
      <ellipse cx="38" cy="66" rx="5" ry="18" fill="#fff" opacity=".18"/>
    </svg>`,

  Bowl: (c) => `
    <svg viewBox="0 0 120 120" aria-hidden="true">
      <path d="M10 48h100a50 46 0 0 1-100 0z" fill="${c}"/>
      <ellipse cx="60" cy="48" rx="50" ry="9" fill="#fff" opacity=".28"/>
      <ellipse
        cx="34" cy="70" rx="5" ry="12"
        fill="#fff" opacity=".18"
        transform="rotate(30 34 70)"
      />
    </svg>`,

  Vase: (c) => `
    <svg viewBox="0 0 120 120" aria-hidden="true">
      <path
        d="M48 12h24v22c0 8 24 16 24 46a24 24 0 0 1-24 24H48
           A24 24 0 0 1 24 80c0-30 24-38 24-46z"
        fill="${c}"
      />
      <rect
        x="44" y="12" width="32" height="7" rx="3.5"
        fill="#fff" opacity=".28"
      />
      <ellipse cx="42" cy="78" rx="5" ry="16" fill="#fff" opacity=".18"/>
    </svg>`,
};

/* ==========================================================================
   State
   ========================================================================== */
let category = "All";
let sortMode = "feat";
let cart = loadCart(); // { [productId]: quantity }

/* ==========================================================================
   Helpers
   ========================================================================== */
const $ = (id) => document.getElementById(id);

const formatMoney = (amount) => "$" + amount.toFixed(0);

const findProduct = (id) => PRODUCTS.find((p) => p.id === Number(id));

const artMarkup = (product) =>
  `<div class="art">${SHAPES[product.type](product.color)}</div>`;

function loadCart() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") || {};
  } catch (error) {
    return {};
  }
}

function saveCart() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  } catch (error) {
    /* Storage can be unavailable; the cart still works for this session. */
  }
}

let toastTimer;
function showToast(message) {
  const toast = $("toast");
  toast.textContent = message;
  toast.classList.add("on");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("on"), 1800);
}

/* ==========================================================================
   Rendering
   ========================================================================== */
function renderChips() {
  $("chips").innerHTML = CATEGORIES.map((name) => {
    const label = name === "All" ? "All" : `${name}s`;
    return `
      <button
        class="chip"
        aria-pressed="${name === category}"
        data-category="${name}"
      >
        ${label}
      </button>`;
  }).join("");
}

function renderGrid() {
  let list = PRODUCTS.filter((p) => category === "All" || p.type === category);

  if (sortMode === "lo") list = [...list].sort((a, b) => a.price - b.price);
  if (sortMode === "hi") list = [...list].sort((a, b) => b.price - a.price);

  $("grid").innerHTML = list
    .map(
      (p) => `
      <article class="card">
        ${artMarkup(p)}
        <div class="info">
          <h3>${p.name}</h3>
          <small>${p.glaze}</small>
          <div class="row">
            <span class="price">${formatMoney(p.price)}</span>
            <button
              class="add"
              data-add="${p.id}"
              aria-label="Add ${p.name} to cart"
            >
              Add to cart
            </button>
          </div>
        </div>
      </article>`,
    )
    .join("");
}

function renderCart() {
  const ids = Object.keys(cart).filter((id) => findProduct(id));

  const itemCount = ids.reduce((sum, id) => sum + cart[id], 0);
  const subtotal = ids.reduce(
    (sum, id) => sum + cart[id] * findProduct(id).price,
    0,
  );

  $("count").textContent = itemCount;
  $("sub").textContent = formatMoney(subtotal);
  $("pay").disabled = itemCount === 0;

  if (ids.length === 0) {
    $("lines").innerHTML = `
      <li class="empty">
        Your cart is empty. Add a piece from the shop to get started.
      </li>`;
  } else {
    $("lines").innerHTML = ids
      .map((id) => {
        const p = findProduct(id);
        return `
          <li class="line">
            ${artMarkup(p)}
            <div>
              <strong>${p.name}</strong>
              <div class="qty">
                <button
                  data-delta="-1"
                  data-id="${id}"
                  aria-label="Decrease quantity"
                >
                  &minus;
                </button>
                <span>${cart[id]}</span>
                <button
                  data-delta="1"
                  data-id="${id}"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
            </div>
            <span class="price">${formatMoney(p.price * cart[id])}</span>
          </li>`;
      })
      .join("");
  }

  saveCart();
}

/* ==========================================================================
   Cart drawer
   ========================================================================== */
function setDrawerOpen(open) {
  $("drawer").classList.toggle("on", open);
  $("scrim").classList.toggle("on", open);
  $("drawer").setAttribute("aria-hidden", String(!open));

  if (open) $("closeCart").focus();
  else $("openCart").focus();
}

/* ==========================================================================
   Events
   ========================================================================== */
$("chips").addEventListener("click", (event) => {
  const next = event.target.dataset.category;
  if (!next) return;
  category = next;
  renderChips();
  renderGrid();
});

$("sort").addEventListener("change", (event) => {
  sortMode = event.target.value;
  renderGrid();
});

$("grid").addEventListener("click", (event) => {
  const id = event.target.dataset.add;
  if (!id) return;
  cart[id] = (cart[id] || 0) + 1;
  renderCart();
  showToast(`${findProduct(id).name} added to cart`);
});

$("lines").addEventListener("click", (event) => {
  const { delta, id } = event.target.dataset;
  if (!delta) return;
  cart[id] += Number(delta);
  if (cart[id] <= 0) delete cart[id];
  renderCart();
});

$("openCart").addEventListener("click", () => setDrawerOpen(true));
$("closeCart").addEventListener("click", () => setDrawerOpen(false));
$("scrim").addEventListener("click", () => setDrawerOpen(false));

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") setDrawerOpen(false);
});

$("pay").addEventListener("click", () => {
  cart = {};
  renderCart();
  setDrawerOpen(false);
  showToast("Order placed. This is a demo, so nothing was charged.");
});

/* ==========================================================================
   Init
   ========================================================================== */
renderChips();
renderGrid();
renderCart();