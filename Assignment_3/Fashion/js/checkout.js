function placeOrder() {
  const form = document.getElementById("checkoutForm");
  if (form && !form.checkValidity()) {
    form.reportValidity();
    return;
  }
  alert("Order Placed Successfully!");
  localStorage.removeItem("cart");
  window.location.href = "index.html";
}

window.onload = () => {
  if (typeof updateCartCount === 'function') updateCartCount();
  if (typeof checkAuthState === 'function') checkAuthState();
};
