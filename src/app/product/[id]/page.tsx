// src/app/product/[id]/page.tsx

'use client';

import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Header } from '@/components/header';
import { useCart } from "@/context/cart-context"; // Import CartItem
import { loadStripe } from "@stripe/stripe-js";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface Mockup {
  id: number;
  name: string;
  image: string;
}

const initialProducts = [
  { id: 1, name: "T-Shirt", price: 24.99, baseImageUrl: "https://static-cdn.toi-media.com/www/uploads/2017/05/hazann.jpg" },
  { id: 2, name: "Mug", price: 14.99, baseImageUrl: "https://static-cdn.toi-media.com/www/uploads/2017/05/hazann.jpg" },
  { id: 3, name: "Phone Case", price: 19.99, baseImageUrl: "https://static-cdn.toi-media.com/www/uploads/2017/05/hazann.jpg" },
  { id: 4, name: "Poster", price: 29.99, baseImageUrl: "https://static-cdn.toi-media.com/www/uploads/2017/05/hazann.jpg" },
  { id: 5, name: "Hoodie", price: 39.99, baseImageUrl: "https://static-cdn.toi-media.com/www/uploads/2017/05/hazann.jpg" },
  { id: 6, name: "Tote Bag", price: 16.99, baseImageUrl: "https://static-cdn.toi-media.com/www/uploads/2017/05/hazann.jpg" },
];

export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { addToCart } = useCart();
  const [mockup, setMockup] = useState<Mockup | null>(null);
  const [product, setProduct] = useState<typeof initialProducts[0] | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    // Retrieve mockups from localStorage
    const savedMockups = localStorage.getItem('mockups');
    if (savedMockups) {
      const mockups: Mockup[] = JSON.parse(savedMockups);
      const selectedMockup = mockups.find(m => m.id === Number(id));
      if (selectedMockup) {
        setMockup(selectedMockup);
        const selectedProduct = initialProducts.find(p => p.id === selectedMockup.id);
        setProduct(selectedProduct);
      } else {
        toast.error("Product not found.");
        router.push('/');
      }
    } else {
      toast.error("No mockups found.");
      router.push('/');
    }
  }, [id, router]);

  // Handle Proceed to Checkout
  const handleCheckout = async () => {
    if (!product || !mockup) {
      toast.error("Product details are missing.");
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
          cartItems: [
            {
              id: product.id,
              name: product.name,
              image: mockup.image,
              price: product.price,
              quantity: 1, // Added quantity
            }
          ]
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

  // Handle Add to Cart
  const handleAddToCart = () => {
    if (!product || !mockup) {
      toast.error("Product details are missing.");
      return;
    }

    addToCart({
      id: product.id,
      name: product.name,
      image: mockup.image,
      price: product.price,
      quantity: 1, // Added quantity
    });
    toast.success(`${product.name} added to cart!`);
  };

  if (!mockup || !product) {
    return null; // Or a loading indicator
  }

  return (
    <>
      <ToastContainer />
      <div className="min-h-screen bg-background flex flex-col items-center p-8">
        <main className="container max-w-4xl flex flex-col items-center space-y-6">
          <h1 className="text-3xl font-bold">{product.name} Preview</h1>
          <img
            src={mockup.image}
            alt={`${product.name} Mockup`}
            className="w-full h-auto rounded-lg shadow-lg"
          />
          <div className="flex space-x-4">
            <Button
              onClick={handleCheckout}
              className={`bg-purple-600 hover:bg-purple-500 text-white px-6 py-3 rounded ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={loading}
            >
              {loading ? "Processing..." : "Proceed to Checkout"}
            </Button>
            <Button
              onClick={handleAddToCart}
              className="bg-green-600 hover:bg-green-500 text-white px-6 py-3 rounded"
            >
              Add to Cart
            </Button>
            <Button
              onClick={() => router.back()}
              variant="outline"
              className="px-6 py-3 rounded"
            >
              Back
            </Button>
          </div>
        </main>
      </div>
    </>
  )
}
