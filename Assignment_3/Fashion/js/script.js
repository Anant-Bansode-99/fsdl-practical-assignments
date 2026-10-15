let displayedProducts = [...products];

function displayProducts(productList) {
  const productContainer = document.getElementById("productContainer");
  productContainer.innerHTML = "";

  productList.forEach((p) => {
    productContainer.innerHTML += `
      <div class="col-md-3 col-sm-6 col-12 mb-4">
        <div class="product-card">
          <div class="img-wrapper">
            <img src="${p.image}" alt="${p.name}">
          </div>
          <div class="card-body">
            <h6 class="card-title text-truncate">${p.name}</h6>
            <p class="card-text">${p.category}</p>
            <p class="price mb-2">₹${p.price}</p>
            <p class="small text-muted mb-3"><i class="fa-solid fa-star text-warning me-1"></i>${p.rating}</p>
            <button class="btn btn-dark" onclick="viewProduct(${p.id})">View Details</button>
          </div>
        </div>
      </div>
    `;
  });
}

function viewProduct(id) {
  window.location.href = `product.html?id=${id}`;
}

function filterCategory(category) {
  if (category === "All") {
    displayedProducts = [...products];
  } else {
    displayedProducts = products.filter(p => p.category === category);
  }
  displayProducts(displayedProducts);
}

function searchProducts() {
  const searchValue = document.getElementById("searchInput").value.toLowerCase();
  const filtered = displayedProducts.filter(p => p.name.toLowerCase().includes(searchValue));
  displayProducts(filtered);
}

function sortProducts() {
  const sortValue = document.getElementById("sortSelect").value;

  if (sortValue === "low") {
    displayedProducts.sort((a, b) => a.price - b.price);
  } else if (sortValue === "high") {
    displayedProducts.sort((a, b) => b.price - a.price);
  } else if (sortValue === "rating") {
    displayedProducts.sort((a, b) => b.rating - a.rating);
  }

  displayProducts(displayedProducts);
}

function updateCartCount() {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  const cartCountEl = document.getElementById("cartCount");
  if (cartCountEl) {
    cartCountEl.innerText = cart.length;
  }
}

// Authentication Logic
function loginUser(event) {
  event.preventDefault();
  localStorage.setItem("luxeLoreAuth", "y");
  window.location.href = "index.html";
}

function loginAdmin(event) {
  event.preventDefault();
  alert("Admin Login Successful");
  localStorage.setItem("luxeLoreAdmin", "y");
  localStorage.setItem("luxeLoreAuth", "y");
  window.location.href = "index.html";
}

function logoutUser() {
  localStorage.removeItem("luxeLoreAuth");
  localStorage.removeItem("luxeLoreAdmin");
  window.location.href = "index.html";
}

function checkAuthState() {
  const isAuth = localStorage.getItem("luxeLoreAuth");
  const navLinks = document.querySelectorAll(".nav-link");

  navLinks.forEach(link => {
    if (link.href.includes("login.html") && isAuth) {
      link.innerHTML = `<i class="fa-solid fa-arrow-right-from-bracket me-1"></i> Sign Out`;
      link.href = "#";
      link.onclick = (e) => {
        e.preventDefault();
        logoutUser();
      };
    }
  });
}

window.onload = () => {
  if (typeof products !== 'undefined' && document.getElementById("productContainer")) {
    displayProducts(products);
  } else if (typeof displayProductDetails === 'function') {
    displayProductDetails();
  } else if (typeof displayCart === 'function') {
    displayCart();
  }
  updateCartCount();
  checkAuthState();
};
