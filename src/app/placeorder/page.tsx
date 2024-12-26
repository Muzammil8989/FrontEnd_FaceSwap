"use client";

import { useSearchParams } from "next/navigation";
import PlaceOrder from "@/components/placeOrder";
import { Suspense } from "react";

function SearchParamsWrapper() {
  const searchParams = useSearchParams();
  
  const swappedUrl = searchParams.get("swappedUrl") || "";
  const mockupUrl = searchParams.get("mockupUrl") || "";
  const productName = searchParams.get("productName") || "Custom Product";
  const productPrice = Number(searchParams.get("price")) || 56.0;
  
  // Parse variantId string into an array of numbers
  const variantIdString = searchParams.get("variantId") || "";
  const variantIds = variantIdString.split(',').map(id => parseInt(id)).filter(id => !isNaN(id));

  return (
    <PlaceOrder
      swappedImageUrl={swappedUrl}
      productMockupUrl={mockupUrl}
      productName={productName}
      productPrice={productPrice}
      variants={variantIds}
    />
  );
}

export default function PlaceOrderPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SearchParamsWrapper />
    </Suspense>
  );
}







// "use client";

// import { useSearchParams } from "next/navigation";
// import PlaceOrder from "@/components/placeOrder";

// export default function PlaceOrderPage() {
//   const searchParams = useSearchParams();
  
//   const swappedUrl = searchParams.get("swappedUrl") || "";
//   const mockupUrl = searchParams.get("mockupUrl") || "";
//   const productName = searchParams.get("productName") || "Custom Product";
//   const productPrice = Number(searchParams.get("price")) || 56.0;
  
//   // Parse variantId string into an array of numbers
//   const variantIdString = searchParams.get("variantId") || "";
//   const variantIds = variantIdString.split(',').map(id => parseInt(id)).filter(id => !isNaN(id));

//   return (
//     <PlaceOrder
//       swappedImageUrl={swappedUrl}
//       productMockupUrl={mockupUrl}
//       productName={productName}
//       productPrice={productPrice}
//       variants={variantIds}
//     />
//   );
// }

