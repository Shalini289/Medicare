import "../styles/cart.css";

export default function Cart({ cart, checkout, updateQuantity, remove, clearCart }) {
  const total = cart.reduce(
    (sum, i) => sum + Number(i.price || 0) * i.quantity,
    0
  );

  return (
    <div className="cart">
      <h3 className="cart-title">Your Cart</h3>

      {cart.length === 0 && (
        <p className="cart-empty">Your cart is empty</p>
      )}

      <div className="cart-items">
        {cart.map(c => (
          <div key={c._id} className="cart-item">
            <div>
              <p className="cart-name">{c.name}</p>
              <span className="cart-qty">Qty: {c.quantity}</span>
              <div className="cart-actions">
                <button onClick={() => updateQuantity(c._id, -1)}>-</button>
                <button onClick={() => updateQuantity(c._id, 1)}>+</button>
                <button onClick={() => remove(c._id)}>Remove</button>
              </div>
            </div>

            <div className="cart-price">
              Rs {Number(c.price || 0) * c.quantity}
            </div>
          </div>
        ))}
      </div>

      {cart.length > 0 && (
        <>
          <div className="cart-total">
            <span>Total</span>
            <strong>Rs {total}</strong>
          </div>

          <button className="btn-primary cart-btn" onClick={checkout}>
            Proceed to Checkout
          </button>

          <button className="cart-clear" onClick={clearCart}>
            Clear Cart
          </button>
        </>
      )}
    </div>
  );
}
