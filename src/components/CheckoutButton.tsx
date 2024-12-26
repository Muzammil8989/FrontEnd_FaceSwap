'use client'

import { FC } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Button } from "@/components/ui/button";

interface CheckoutButtonProps {
  cartItems: Array<{
    id: number;
    name: string;
    image: string;
    price: number;
    quantity: number;
  }>;
}

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "");

const CheckoutButton: FC<CheckoutButtonProps> = ({ cartItems }) => {
  const handleCheckout = async () => {
    const stripe = await stripePromise;
    if (!stripe) {
      alert("Stripe failed to load.");
      return;
    }

    const response = await fetch("http://localhost:5000/create-checkout-session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ cartItems }),
    });

    const data = await response.json();

    if (data.url) {
      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } else {
      alert("Failed to create checkout session.");
    }
  };

  return (
    <Button
      onClick={handleCheckout}
      className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-3 rounded"
    >
      Proceed to Checkout
    </Button>
  );
};

export default CheckoutButton;
