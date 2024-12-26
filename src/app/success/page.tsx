"use client"; // Ensure this is added for client-side rendering
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation'; // Correct hook for App Router
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function SuccessPage() {
  const router = useRouter();
  const [orderStatus, setOrderStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    async function createOrder() {
      const sessionId = new URLSearchParams(window.location.search).get('session_id'); // Get session_id from URL

      if (sessionId) {
        try {
          const response = await fetch('/api/create-order', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ sessionId }),
          });

          if (response.ok) {
            setOrderStatus('success');
            toast.success('Order placed successfully!');
          } else {
            setOrderStatus('error');
            toast.error('Failed to create order');
          }
        } catch (error) {
          console.error('Error creating order:', error);
          setOrderStatus('error');
          toast.error('Error creating order');
        }
      }
    }

    createOrder();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <ToastContainer />
      <div className="bg-white p-8 rounded-lg shadow-md w-96 text-center">
        <h1 className="text-2xl font-bold mb-4">Thank you for your order!</h1>
        {orderStatus === 'loading' && <p>Processing your order...</p>}
        {orderStatus === 'success' && (
          <p>Your order has been placed successfully. We'll send you a confirmation email shortly.</p>
        )}
        {orderStatus === 'error' && (
          <p className="text-red-500">There was an error processing your order. Please contact customer support.</p>
        )}
      </div>
    </div>
  );
}









// 'use client';

// import { useEffect } from "react";
// import { useRouter, useSearchParams } from "next/navigation";
// import { Button } from "@/components/ui/button";
// import { Header } from '@/components/header';
// import { useCart } from "@/context/cart-context";
// import { toast, ToastContainer } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
// import { Suspense } from "react";

// function SuccessContent() {
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const sessionId = searchParams.get('session_id');
//   const { clearCart } = useCart();

//   useEffect(() => {
//     if (sessionId) {
//       toast.success("Payment successful! Thank you for your purchase.");
//       clearCart();
//     }
//   }, [sessionId, clearCart]);

//   return (
//     <>
//       <ToastContainer />
//       <div className="min-h-screen bg-background flex flex-col items-center p-8">
//         <main className="container max-w-4xl flex flex-col items-center space-y-6">
//           <h1 className="text-3xl font-bold">Thank You for Your Purchase!</h1>
//           <p>Your transaction has been successfully completed.</p>
//           <Button
//             onClick={() => router.push('/')}
//             className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded"
//           >
//             Return to Home
//           </Button>
//         </main>
//       </div>
//     </>
//   );
// }

// export default function SuccessPage() {
//   return (
//     <>
//       <Suspense fallback={<div>Loading...</div>}>
//         <SuccessContent />
//       </Suspense>
//     </>
//   );
// }
