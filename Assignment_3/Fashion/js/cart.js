function displayCart() {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  const cartItems = document.getElementById("cartItems");

  if (cart.length === 0) {
    cartItems.innerHTML = "<h4>Your cart is empty!</h4>";
    document.getElementById("cartSummary").innerHTML = "";
    return;
  }

  cartItems.innerHTML = "";
  let subtotal = 0;

  cart.forEach((item, index) => {
    subtotal += item.price * item.qty;

    cartItems.innerHTML += `
      <div class="cart-item">
        <div class="d-flex align-items-center w-100">
          <img src="${item.image}" class="cart-img" alt="${item.name}">
          <div class="flex-grow-1">
            <h6 class="fw-bold mb-1">${item.name}</h6>
            <p class="mb-1 text-muted small">Size: ${item.size}</p>
            <p class="mb-0 fw-bold" style="color: var(--accent-color);">₹${item.price}</p>
          </div>
          
          <div class="d-flex align-items-center ms-auto me-4 bg-light rounded-pill px-2 py-1">
            <button class="btn btn-sm btn-link text-dark text-decoration-none shadow-none" onclick="changeQty(${index}, -1)"><i class="fa-solid fa-minus small"></i></button>
            <span class="mx-2 fw-bold">${item.qty}</span>
            <button class="btn btn-sm btn-link text-dark text-decoration-none shadow-none" onclick="changeQty(${index}, 1)"><i class="fa-solid fa-plus small"></i></button>
          </div>

          <button class="btn btn-outline-danger btn-sm rounded-circle shadow-none d-flex align-items-center justify-content-center" style="width: 35px; height: 35px;" onclick="removeItem(${index})"><i class="fa-solid fa-trash-can"></i></button>
        </div>
      </div>
    `;
  });

  let delivery = subtotal > 2000 ? 0 : 100;
  let discount = subtotal > 3000 ? 200 : 0;
  let total = subtotal + delivery - discount;

  document.getElementById("cartSummary").innerHTML = `
    <div>
      <h5 class="fw-bold mb-4">Order Summary</h5>
      <div class="d-flex justify-content-between mb-2">
        <span class="text-muted">Subtotal</span>
        <span class="fw-semibold">₹${subtotal}</span>
      </div>
      <div class="d-flex justify-content-between mb-2">
        <span class="text-muted">Delivery Charge</span>
        <span class="fw-semibold">₹${delivery}</span>
      </div>
      <div class="d-flex justify-content-between mb-3">
        <span class="text-muted">Discount</span>
        <span class="text-success fw-semibold">-₹${discount}</span>
      </div>
      <hr class="border-secondary mb-3 opacity-25">
      <div class="d-flex justify-content-between mb-4">
        <span class="fw-bold fs-5">Total</span>
        <span class="fw-bold fs-5" style="color: var(--accent-color);">₹${total}</span>
      </div>
      <a href="checkout.html" class="btn btn-dark w-100 py-3 fw-bold shadow">Proceed to Checkout</a>
    </div>
  `;
}

function changeQty(index, change) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  cart[index].qty += change;

  if (cart[index].qty <= 0) {
    cart.splice(index, 1);
  }

  localStorage.setItem("cart", JSON.stringify(cart));
  displayCart();
}

function removeItem(index) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  cart.splice(index, 1);
  localStorage.setItem("cart", JSON.stringify(cart));
  displayCart();
}

window.onload = () => {
  displayCart();
  if (typeof updateCartCount === 'function') updateCartCount();
  if (typeof checkAuthState === 'function') checkAuthState();
};
