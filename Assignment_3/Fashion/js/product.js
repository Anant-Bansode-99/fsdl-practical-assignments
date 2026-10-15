function getProductId() {
  const params = new URLSearchParams(window.location.search);
  return parseInt(params.get("id"));
}

function displayProductDetails() {
  const id = getProductId();
  const product = products.find(p => p.id === id);

  if (!product) {
    document.getElementById("productDetails").innerHTML = "<h3>Product not found</h3>";
    return;
  }

  document.getElementById("productDetails").innerHTML = `
    <div class="row g-5 align-items-center">
      <div class="col-md-5">
        <div class="glass p-3 rounded-4">
          <img src="${product.image}" class="img-fluid rounded-4 shadow-sm w-100" alt="${product.name}">
        </div>
      </div>

      <div class="col-md-7">
        <h2 class="fw-bold fs-1 mb-2 text-primary-color">${product.name}</h2>
        <p class="text-muted fs-5 mb-4">${product.category}</p>
        <h4 class="fw-bold fs-2 mb-3" style="color: var(--accent-color);">₹${product.price}</h4>
        <p class="mb-4 text-muted"><i class="fa-solid fa-star text-warning me-1"></i> ${product.rating} Rating</p>
        <p class="lead mb-5" style="font-size: 1.1rem; line-height: 1.8;">${product.description}</p>

        <div class="row g-3 mb-4">
          <div class="col-sm-6">
            <label class="fw-bold small text-muted text-uppercase mb-2" style="letter-spacing: 1px;">Select Size</label>
            <select class="form-select form-select-lg" id="sizeSelect">
              <option>S</option>
              <option>M</option>
              <option>L</option>
              <option>XL</option>
            </select>
          </div>
          <div class="col-sm-6">
            <label class="fw-bold small text-muted text-uppercase mb-2" style="letter-spacing: 1px;">Quantity</label>
            <input type="number" id="qty" class="form-control form-select-lg" value="1" min="1">
          </div>
        </div>

        <button class="btn btn-dark btn-lg w-100 py-3 mt-3 shadow" onclick="addToCart(${product.id})">
          <i class="fa-solid fa-bag-shopping me-2"></i> Add to Bag
        </button>
      </div>
    </div>
  `;
}

function addToCart(id) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  const product = products.find(p => p.id === id);

  const qty = parseInt(document.getElementById("qty").value);
  const size = document.getElementById("sizeSelect").value;

  cart.push({ ...product, qty: qty, size: size });

  localStorage.setItem("cart", JSON.stringify(cart));
  alert("Product Added to Cart!");
  window.location.href = "cart.html";
}

window.onload = displayProductDetails;
