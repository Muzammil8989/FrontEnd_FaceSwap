// src/app/checkout/page.tsx

'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Header } from '@/components/header';
import { useCart, CartItem } from "@/context/cart-context";
import { loadStripe } from "@stripe/stripe-js";
// import { useRouter } from "next/navigation";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function CheckoutPage() {
  const { items, removeItem, updateQuantity, clearCart } = useCart();
  // const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);

  // Calculate total price
  const totalPrice = items.reduce((acc: number, item: CartItem) => acc + (item.quantity * item.price), 0);

  // Function to handle checkout
  const handleCheckout = async () => {
    if (items.length === 0) {
      toast.error("Your cart is empty.");
      return;
    }

    setLoading(true);
    try {
      // Initialize Stripe
      const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "");
      if (!stripe) {
        toast.error("Stripe failed to load.");
        setLoading(false);
        return;
      }

      // Create a checkout session
      const response = await fetch("http://localhost:5000/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cartItems: items.map(item => ({
            id: item.id,
            name: item.name,
            image: item.image,
            price: item.price,
            quantity: item.quantity,
          }))
        }),
      });

      const data = await response.json();

      if (data.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url;
      } else {
        toast.error("Failed to create checkout session.");
      }
    } catch (error) {
      console.error("Error during checkout:", error);
      toast.error("Error during checkout.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ToastContainer />
      <div className="min-h-screen bg-background flex flex-col items-center py-8">
        <main className="container px-4 md:px-6 flex-grow flex flex-col justify-center items-center space-y-6">
          <h1 className="text-3xl font-bold">Checkout</h1>
          {items.length === 0 ? (
            <p>Your cart is empty.</p>
          ) : (
            <div className="w-full max-w-3xl bg-white shadow-md rounded-lg p-6">
              {items.map(item => (
                <div key={item.id} className="flex items-start justify-between mb-4 gap-x-5">
                  <img src={item.image} alt={item.name} className="w-24 h-24 object-cover rounded" />
                  <div className="flex-1 mx-4">
                    <h2 className="text-lg font-semibold">{item.name}</h2>
                    <p className="text-blue-600 font-semibold">${item.price.toFixed(2)}</p>
                    <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                  </div>
                  <div className="flex flex-col  items-center justify-between gap-y-1">
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => {
                        updateQuantity(item.id, item.quantity - 1);
                      }}
                      className="bg-transparent hover:bg-slate-50 border border-zinc-600 text-black w-4 h-8 rounded-full text-lg"
                      aria-label={`Decrease quantity of ${item.name}`}
                    >
                      -
                    </Button>
                    <Button
                      onClick={() => {
                        updateQuantity(item.id, item.quantity + 1);
                      }}
                      className="bg-transparent hover:bg-slate-50 border border-zinc-600 text-black w-4 h-8 rounded-full text-lg"
                      aria-label={`Increase quantity of ${item.name}`}
                    >
                      +
                    </Button>
                  </div>
                    <Button
                      onClick={() => {
                        removeItem(item.id);
                      }}
                      className="bg-zinc-900 hover:bg-zinc-800 text-white px-2 py-1 rounded"
                      aria-label={`Remove ${item.name} from cart`}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
              <div className="flex justify-between items-center mt-6">
                <h3 className="text-xl font-semibold">Total: ${totalPrice.toFixed(2)}</h3>
                <div className="flex space-x-4">
                  <Button
                    onClick={handleCheckout}
                    className={`bg-zinc-900 hover:bg-zinc-800 text-white px-6 py-3 rounded ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={loading}
                  >
                    {loading ? "Processing..." : "Pay Now"}
                  </Button>
                  <Button
                    onClick={() => {
                      clearCart();
                      toast.success("Cart cleared.");
                    }}
                    variant="outline"
                    className="px-6 py-3 rounded"
                  >
                    Clear Cart
                  </Button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  )
}
