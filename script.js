let userAge = null;
let currentUser = null;

let products = JSON.parse(localStorage.getItem("swypa_products")) || [];

const feed = document.getElementById("product-feed");
const categorySelect = document.getElementById("category");
const uploadForm = document.getElementById("upload-form");
const signInBtn = document.getElementById("sign-in");
const signOutBtn = document.getElementById("sign-out");
const userInfo = document.getElementById("user-info");
const myStoreBtn = document.getElementById("my-store");
const loginModal = document.getElementById("login-modal");
const browseBtn = document.getElementById("browse-guest");
const googleLoginBtn = document.getElementById("google-login");
const emailLoginBtn = document.getElementById("email-login");

const savedAge = localStorage.getItem("swypa_user_age");
const savedUser = JSON.parse(localStorage.getItem("swypa_user"));

if (savedAge) {
  userAge = parseInt(savedAge);
  document.getElementById("age-check").style.display = "none";
  if (!savedUser) {
    loginModal.style.display = "flex";
  } else {
    setUser(savedUser);
  }
  checkHash();
} else {
  feed.innerHTML = "<p style='padding:1rem;'>Please enter your age to begin.</p>";
}

function verifyAge() {
  const input = document.getElementById("age-input").value;
  if (!input || isNaN(input) || input < 1) return alert("Enter a valid age");
  userAge = parseInt(input);
  localStorage.setItem("swypa_user_age", userAge);
  document.getElementById("age-check").style.display = "none";
  loginModal.style.display = "flex";
}

function renderProducts(filter = "all", vendorName = null) {
  feed.innerHTML = "";

  let filtered = products
    .filter(p => filter === "all" || p.category === filter)
    .filter(p => !p.ageRestricted || userAge >= 18);

  if (vendorName) {
    filtered = filtered.filter(p => p.vendor === vendorName);
    const title = document.createElement("h2");
    title.textContent = `Store: ${vendorName}`;
    feed.appendChild(title);
  }

  filtered.forEach(p => {
    const el = document.createElement("div");
    el.className = "product";
    const buyButton = `<button onclick="${currentUser ? "alert('Purchase successful')" : "promptLogin()"}">${currentUser ? "Buy Now" : "Login to Buy"}</button>`;
    el.innerHTML = `
      <h3>${p.name} ${p.isVerified ? '<span class="verified">✔</span>' : ''}</h3>
      <p>${p.price}</p>
      <p>Category: ${p.category}</p>
      <p>${p.description}</p>
      <p class="review">⭐ ${p.rating || 0} / 5</p>
      ${p.tiktok ? `<iframe src="${p.tiktok}" width="100%" height="300" style="border:none;"></iframe>` : ''}
      ${buyButton}
    `;
    feed.appendChild(el);
  });
}

function promptLogin() {
  alert("Please log in to make purchases.");
  loginModal.style.display = "flex";
}

categorySelect.addEventListener("change", () => {
  renderProducts(categorySelect.value);
});

uploadForm.addEventListener("submit", e => {
  e.preventDefault();
  if (!currentUser) return alert("You must be signed in to upload.");

  const newProduct = {
    id: Date.now(),
    vendor: currentUser.name,
    name: document.getElementById("name").value,
    price: document.getElementById("price").value,
    category: document.getElementById("upload-category").value,
    description: document.getElementById("description").value,
    tiktok: document.getElementById("tiktok").value,
    ageRestricted: document.getElementById("age-restricted").checked,
    isVerified: true,
    rating: 0
  };

  products.push(newProduct);
  localStorage.setItem("swypa_products", JSON.stringify(products));

  renderProducts(categorySelect.value);
  uploadForm.reset();
  alert("Product uploaded successfully!");
});

function checkHash() {
  const hash = location.hash;
  if (hash.startsWith("#vendor=")) {
    const vendor = decodeURIComponent(hash.split("=")[1]);
    renderProducts("all", vendor);
  } else {
    renderProducts(categorySelect.value);
  }
}

window.addEventListener("hashchange", checkHash);

myStoreBtn?.addEventListener("click", () => {
  if (currentUser) {
    location.hash = `#vendor=${encodeURIComponent(currentUser.name)}`;
  }
});

function setUser(user) {
  currentUser = user;
  localStorage.setItem("swypa_user", JSON.stringify(user));
  userInfo.innerHTML = `
    <div class="user-info">
      <div class="avatar">${user.name.charAt(0).toUpperCase()}</div>
      <span>${user.name}</span>
    </div>
  `;
  signInBtn.style.display = "none";
  signOutBtn.style.display = "inline-block";
  uploadForm.style.display = "block";
  myStoreBtn.style.display = "inline-block";
  loginModal.style.display = "none";
}

function clearUser() {
  currentUser = null;
  localStorage.removeItem("swypa_user");
  userInfo.textContent = "Not signed in";
  signInBtn.style.display = "inline-block";
  signOutBtn.style.display = "none";
  uploadForm.style.display = "none";
  myStoreBtn.style.display = "none";
}

signInBtn?.addEventListener("click", () => {
  loginModal.style.display = "flex";
});

signOutBtn?.addEventListener("click", () => {
  clearUser();
});

googleLoginBtn?.addEventListener("click", () => {
  const name = prompt("Enter your Google name:");
  if (name) setUser({ name });
});

emailLoginBtn?.addEventListener("click", () => {
  const name = prompt("Enter your email address:");
  if (name) setUser({ name });
});

browseBtn?.addEventListener("click", () => {
  loginModal.style.display = "none";
});
