"use client";
import React, { useState, ChangeEvent, FormEvent, useEffect } from "react";
import { toast, ToastContainer } from 'react-toastify'
import { loadStripe } from '@stripe/stripe-js';

interface Variant {
  id: number;
  name: string;
  // Add any other properties that might be relevant
}

interface PlaceOrderProps {
  swappedImageUrl: string;
  productMockupUrl: string;
  productName: string;
  productPrice: number;
  variants: number[] | Variant[];
}

// Shipping recipient info
interface Recipient {
  name: string;
  address1: string;
  city: string;
  state_code: string;
  country_code: string;
  zip: string;
}

// Printful order "files"
interface OrderItemFile {
  url: string; // We'll use the Printful "preview_url" here
}

// One item in the order
interface OrderItem {
  variant_id: number;
  quantity: number;
  files: OrderItemFile[];
}

// Entire order request
interface OrderRequest {
  recipient: Recipient;
  items: OrderItem[];
}

// Response from /place-order
interface OrderResponse {
  message: string;
  error?: string;
}

const PlaceOrder: React.FC<PlaceOrderProps> = ({
  swappedImageUrl,
  productMockupUrl,
  productName,
  productPrice,
  variants
}) => {
  const [recipient, setRecipient] = useState<Recipient>({
    name: "",
    address1: "",
    city: "",
    state_code: "",
    country_code: "",
    zip: "",
  });

  const [selectedVariant, setSelectedVariant] = useState<number | null>(null);
  const [printfulFileId, setPrintfulFileId] = useState<number | null>(null);
  const [gender, setGender] = useState("");

  const [loading, setLoading] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    if (variants.length > 0 && selectedVariant === null) {
      setSelectedVariant(typeof variants[0] === 'number' ? variants[0] : variants[0].id);
    }
  }, [variants, selectedVariant]);

  const handleRecipientChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRecipient((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleVariantChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setSelectedVariant(Number(e.target.value));
  };

  const handleGenderChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setGender(e.target.value);
  };

  const handleCheckout = async () => {
    if (!selectedVariant) {
      toast.error("Please select a product variant.");
      return;
    }

    setLoading(true);
    try {
      let fileId = printfulFileId;
      if (!fileId) {
        fileId = await uploadToPrintful(swappedImageUrl);
        setPrintfulFileId(fileId);
      }

      const previewUrl = await getPreviewUrl(fileId);

      const orderRequest: OrderRequest = {
        recipient: {
          name: recipient.name,
          address1: recipient.address1,
          city: recipient.city,
          state_code: recipient.state_code,
          country_code: recipient.country_code,
          zip: recipient.zip,
        },
        items: [
          {
            variant_id: selectedVariant,
            quantity: 1,
            files: [
              {
                url: previewUrl,
              },
            ],
          },
        ],
      };

      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderRequest),
      });

      const data = await response.json();

      if (data.url) {
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

  const uploadToPrintful = async (imageUrl: string): Promise<number> => {
    const fileName = "My-Cool-Design";
    const response = await fetch("https://face-swap-backend-gamma.vercel.app/files", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileUrl: imageUrl, fileName }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Error uploading file to Printful.");
    }

    const data = await response.json();
    const fileId = data.data.id; 
    console.log("File uploaded. ID is:", fileId);

    console.log("Waiting 10 seconds before returning file ID...");
    await waitTenSeconds();
    console.log("Wait complete. Returning file ID:", fileId);

    return fileId;
  };

  const waitTenSeconds = async () => {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        resolve();
      }, 10000);
    });
  };

  const getPreviewUrl = async (fileId: number): Promise<string> => {
    const response = await fetch(`https://face-swap-backend-gamma.vercel.app/files/${fileId}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Error retrieving file info.");
    }

    const data = await response.json();
    return data.result.preview_url;
  };

  return (
    <>
    <ToastContainer />
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-6xl w-full rounded-lg shadow-md overflow-hidden">
        <div className="md:flex">
          {/* LEFT COLUMN: Product & Price */}
          <div className="md:w-1/2 p-6 border-r border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">{productName || "Product"}</h2>
            <p className="text-xl font-semibold text-gray-700 mb-4">${productPrice.toFixed(2)}</p>
            <div className="w-full h-80 bg-gray-100 rounded-md flex items-center justify-center overflow-hidden">
              {productMockupUrl ? (
                <img
                  src={productMockupUrl}
                  alt="Mockup"
                  className="object-contain h-full w-auto transition-transform duration-300 transform hover:scale-105"
                />
              ) : (
                <span className="text-gray-400 text-sm">{"<Dynamic Product Image>"}</span>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Customization + Shipping */}
          <div className="md:w-1/2 p-6">
            {/* Product Customization */}
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Product Customization</h3>

            {/* Customization Form */}
            <div className="space-y-4">
              {/* Variant Selection */}
              <div>
                <label htmlFor="variant" className="block text-sm font-medium text-gray-700 mb-1">
                  Variant <span className="text-red-500">*</span>
                </label>
                <select
                  id="variant"
                  value={selectedVariant?.toString() || ""}
                  onChange={handleVariantChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Variant</option>
                  {variants.map((variant) => (
                    <option key={typeof variant === 'number' ? variant : variant.id} value={typeof variant === 'number' ? variant : variant.id}>
                      {typeof variant === 'number' ? `Variant ${variant}` : variant.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Gender */}
              {/* <div>
                <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
                  Gender <span className="text-red-500">*</span>
                </label>
                <select
                  id="gender"
                  value={gender}
                  onChange={handleGenderChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Gender</option>
                  <option value="Unisex">Unisex</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div> */}
            </div>

            <hr className="my-6 border-gray-300" />

            {/* Shipping and Payment */}
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Shipping Details & Payment</h3>

            {/* Shipping Form */}
            <form onSubmit={(e) => { e.preventDefault(); handleCheckout(); }} className="space-y-4">
              {/* Recipient Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Recipient Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={recipient.name}
                  onChange={handleRecipientChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="John Doe"
                  required
                />
              </div>

              {/* Address Line 1 */}
              <div>
                <label htmlFor="address1" className="block text-sm font-medium text-gray-700 mb-1">
                  Address Line 1 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="address1"
                  name="address1"
                  value={recipient.address1}
                  onChange={handleRecipientChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="123 Main St"
                  required
                />
              </div>

              {/* City */}
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                  City <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={recipient.city}
                  onChange={handleRecipientChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="New York"
                  required
                />
              </div>

              {/* State Code */}
              <div>
                <label htmlFor="state_code" className="block text-sm font-medium text-gray-700 mb-1">
                  State Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="state_code"
                  name="state_code"
                  value={recipient.state_code}
                  onChange={handleRecipientChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="NY"
                  required
                />
              </div>

              {/* Country Code */}
              <div>
                <label htmlFor="country_code" className="block text-sm font-medium text-gray-700 mb-1">
                  Country Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="country_code"
                  name="country_code"
                  value={recipient.country_code}
                  onChange={handleRecipientChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="US"
                  required
                />
              </div>

              {/* ZIP Code */}
              <div>
                <label htmlFor="zip" className="block text-sm font-medium text-gray-700 mb-1">
                  ZIP Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="zip"
                  name="zip"
                  value={recipient.zip}
                  onChange={handleRecipientChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="10001"
                  required
                />
              </div>

              {/* Submit Button & Status */}
              <div className="mt-6">
                {loading ? (
                  <button
                    type="button"
                    className="w-full bg-blue-500 text-white py-2 px-4 rounded-md cursor-not-allowed flex items-center justify-center"
                    disabled
                  >
                    <svg
                      className="animate-spin h-5 w-5 mr-3 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8H4z"
                      ></path>
                    </svg>
                    Placing your order...
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors duration-300"
                  >
                    Place Order
                  </button>
                )}
              </div>

              {/* Success Message */}
              {successMessage && (
                <div className="mt-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-md">
                  {successMessage}
                </div>
              )}

              {/* Error Message */}
              {errorMessage && (
                <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md">
                  {errorMessage}
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default PlaceOrder;














// "use client";
// import React, { useState, ChangeEvent, FormEvent, useEffect } from "react";
// import { toast, ToastContainer } from 'react-toastify'

// interface Variant {
//   id: number;
//   name: string;
//   // Add any other properties that might be relevant
// }

// interface PlaceOrderProps {
//   swappedImageUrl: string;
//   productMockupUrl: string;
//   productName: string;
//   productPrice: number;
//   variants: number[] | Variant[];
// }

// // Shipping recipient info
// interface Recipient {
//   name: string;
//   address1: string;
//   city: string;
//   state_code: string;
//   country_code: string;
//   zip: string;
// }

// // Printful order "files"
// interface OrderItemFile {
//   url: string; // We'll use the Printful "preview_url" here
// }

// // One item in the order
// interface OrderItem {
//   variant_id: number;
//   quantity: number;
//   files: OrderItemFile[];
// }

// // Entire order request
// interface OrderRequest {
//   recipient: Recipient;
//   items: OrderItem[];
// }

// // Response from /place-order
// interface OrderResponse {
//   message: string;
//   error?: string;
// }

// const PlaceOrder: React.FC<PlaceOrderProps> = ({
//   swappedImageUrl,
//   productMockupUrl,
//   productName,
//   productPrice,
//   variants
// }) => {
//   const [recipient, setRecipient] = useState<Recipient>({
//     name: "",
//     address1: "",
//     city: "",
//     state_code: "",
//     country_code: "",
//     zip: "",
//   });

//   const [selectedVariant, setSelectedVariant] = useState<number | null>(null);
//   const [printfulFileId, setPrintfulFileId] = useState<number | null>(null);
//   const [gender, setGender] = useState("");

//   const [loading, setLoading] = useState<boolean>(false);
//   const [successMessage, setSuccessMessage] = useState<string>("");
//   const [errorMessage, setErrorMessage] = useState<string>("");

//   useEffect(() => {
//     if (variants.length > 0 && selectedVariant === null) {
//       setSelectedVariant(typeof variants[0] === 'number' ? variants[0] : variants[0].id);
//     }
//   }, [variants, selectedVariant]);

//   const handleRecipientChange = (e: ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target;
//     setRecipient((prev) => ({
//       ...prev,
//       [name]: value,
//     }));
//   };

//   const handleVariantChange = (e: ChangeEvent<HTMLSelectElement>) => {
//     setSelectedVariant(Number(e.target.value));
//   };

//   const handleGenderChange = (e: ChangeEvent<HTMLSelectElement>) => {
//     setGender(e.target.value);
//   };

//     const handleCheckout = async () => {
//       if (items.length === 0) {
//         toast.error("Your cart is empty.");
//         return;
//       }
  
//       setLoading(true);
//       try {
//         // Initialize Stripe
//         const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "");
//         if (!stripe) {
//           toast.error("Stripe failed to load.");
//           setLoading(false);
//           return;
//         }
  
//         // Create a checkout session
//         const response = await fetch("http://localhost:5000/create-checkout-session", {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({
//             cartItems: items.map(item => ({
//               id: item.id,
//               name: item.name,
//               image: item.image,
//               price: item.price,
//               quantity: item.quantity,
//             }))
//           }),
//         });
  
//         const data = await response.json();
  
//         if (data.url) {
//           // Redirect to Stripe Checkout
//           window.location.href = data.url;
//         } else {
//           toast.error("Failed to create checkout session.");
//         }
//       } catch (error) {
//         console.error("Error during checkout:", error);
//         toast.error("Error during checkout.");
//       } finally {
//         setLoading(false);
//       }
//     };
//   const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
//     e.preventDefault();
//     setLoading(true);
//     setErrorMessage("");
//     setSuccessMessage("");

//     const { name, address1, city, state_code, country_code, zip } = recipient;
//     if (!name || !address1 || !city || !state_code || !country_code || !zip) {
//       setErrorMessage("Please fill in all shipping fields.");
//       setLoading(false);
//       return;
//     }
//     if (!swappedImageUrl) {
//       setErrorMessage("No swapped image URL provided. Please go back and generate the image.");
//       setLoading(false);
//       return;
//     }
//     if (selectedVariant === null) {
//       setErrorMessage("Please select a variant.");
//       setLoading(false);
//       return;
//     }

//     try {
//       let fileId = printfulFileId;
//       if (!fileId) {
//         fileId = await uploadToPrintful(swappedImageUrl);
//         setPrintfulFileId(fileId);
//       }

//       const previewUrl = await getPreviewUrl(fileId!);
//       console.log("Preview URL:", previewUrl);

//       const orderRequest: OrderRequest = {
//         recipient: {
//           name,
//           address1,
//           city,
//           state_code,
//           country_code,
//           zip,
//         },
//         items: [
//           {
//             variant_id: selectedVariant,
//             quantity: 1,
//             files: [
//               {
//                 url: previewUrl,
//               },
//             ],
//           },
//         ],
//       };

//       const placeOrderResponse = await fetch("http://localhost:5000/place-order", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(orderRequest),
//       });
//       const result: OrderResponse = await placeOrderResponse.json();

//       if (placeOrderResponse.ok) {
//         setSuccessMessage("Order placed successfully!");
//         setRecipient({
//           name: "",
//           address1: "",
//           city: "",
//           state_code: "",
//           country_code: "",
//           zip: "",
//         });
//         setSelectedVariant(null);
//         setGender("");
//         setPrintfulFileId(null);
//       } else {
//         setErrorMessage(result.message || "An error occurred while placing the order.");
//         console.error("Place Order Error:", result.error);
//       }
//     } catch (error: any) {
//       console.error("Error placing order:", error);
//       setErrorMessage(error.message || "An unexpected error occurred. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const uploadToPrintful = async (imageUrl: string): Promise<number> => {
//     const fileName = "My-Cool-Design";
//     const response = await fetch("http://localhost:5000/files", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ fileUrl: imageUrl, fileName }),
//     });

//     if (!response.ok) {
//       const errorData = await response.json();
//       throw new Error(errorData.message || "Error uploading file to Printful.");
//     }

//     const data = await response.json();
//     const fileId = data.data.id; 
//     console.log("File uploaded. ID is:", fileId);

//     console.log("Waiting 10 seconds before returning file ID...");
//     await waitTenSeconds();
//     console.log("Wait complete. Returning file ID:", fileId);

//     return fileId;
//   };

//   const waitTenSeconds = async () => {
//     return new Promise<void>((resolve) => {
//       setTimeout(() => {
//         resolve();
//       }, 10000);
//     });
//   };

//   const getPreviewUrl = async (fileId: number): Promise<string> => {
//     const response = await fetch(`http://localhost:5000/files/${fileId}`, {
//       method: "GET",
//       headers: { "Content-Type": "application/json" },
//     });

//     if (!response.ok) {
//       const errorData = await response.json();
//       throw new Error(errorData.message || "Error retrieving file info.");
//     }

//     const data = await response.json();
//     return data.result.preview_url;
//   };

//   return (
//     <>
//     <ToastContainer />
//     <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
//       <div className="max-w-6xl w-full rounded-lg shadow-md overflow-hidden">
//         <div className="md:flex">
//           {/* LEFT COLUMN: Product & Price */}
//           <div className="md:w-1/2 p-6 border-r border-gray-200">
//             <h2 className="text-2xl font-bold text-gray-800 mb-2">{productName || "Product"}</h2>
//             <p className="text-xl font-semibold text-gray-700 mb-4">${productPrice.toFixed(2)}</p>
//             <div className="w-full h-80 bg-gray-100 rounded-md flex items-center justify-center overflow-hidden">
//               {productMockupUrl ? (
//                 <img
//                   src={productMockupUrl}
//                   alt="Mockup"
//                   className="object-contain h-full w-auto transition-transform duration-300 transform hover:scale-105"
//                 />
//               ) : (
//                 <span className="text-gray-400 text-sm">{"<Dynamic Product Image>"}</span>
//               )}
//             </div>
//           </div>

//           {/* RIGHT COLUMN: Customization + Shipping */}
//           <div className="md:w-1/2 p-6">
//             {/* Product Customization */}
//             <h3 className="text-lg font-semibold text-gray-800 mb-4">Product Customization</h3>

//             {/* Customization Form */}
//             <div className="space-y-4">
//               {/* Variant Selection */}
//               <div>
//                 <label htmlFor="variant" className="block text-sm font-medium text-gray-700 mb-1">
//                   Variant <span className="text-red-500">*</span>
//                 </label>
//                 <select
//                   id="variant"
//                   value={selectedVariant?.toString() || ""}
//                   onChange={handleVariantChange}
//                   className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   required
//                 >
//                   <option value="">Select Variant</option>
//                   {variants.map((variant) => (
//                     <option key={typeof variant === 'number' ? variant : variant.id} value={typeof variant === 'number' ? variant : variant.id}>
//                       {typeof variant === 'number' ? `Variant ${variant}` : variant.name}
//                     </option>
//                   ))}
//                 </select>
//               </div>

//               {/* Gender */}
//               {/* <div>
//                 <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
//                   Gender <span className="text-red-500">*</span>
//                 </label>
//                 <select
//                   id="gender"
//                   value={gender}
//                   onChange={handleGenderChange}
//                   className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   required
//                 >
//                   <option value="">Select Gender</option>
//                   <option value="Unisex">Unisex</option>
//                   <option value="Male">Male</option>
//                   <option value="Female">Female</option>
//                   <option value="Other">Other</option>
//                 </select>
//               </div> */}
//             </div>

//             <hr className="my-6 border-gray-300" />

//             {/* Shipping and Payment */}
//             <h3 className="text-lg font-semibold text-gray-800 mb-4">Shipping Details & Payment</h3>

//             {/* Shipping Form */}
//             <form onSubmit={handleSubmit} className="space-y-4">
//               {/* Recipient Name */}
//               <div>
//                 <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
//                   Recipient Name <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   type="text"
//                   id="name"
//                   name="name"
//                   value={recipient.name}
//                   onChange={handleRecipientChange}
//                   className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   placeholder="John Doe"
//                   required
//                 />
//               </div>

//               {/* Address Line 1 */}
//               <div>
//                 <label htmlFor="address1" className="block text-sm font-medium text-gray-700 mb-1">
//                   Address Line 1 <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   type="text"
//                   id="address1"
//                   name="address1"
//                   value={recipient.address1}
//                   onChange={handleRecipientChange}
//                   className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   placeholder="123 Main St"
//                   required
//                 />
//               </div>

//               {/* City */}
//               <div>
//                 <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
//                   City <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   type="text"
//                   id="city"
//                   name="city"
//                   value={recipient.city}
//                   onChange={handleRecipientChange}
//                   className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   placeholder="New York"
//                   required
//                 />
//               </div>

//               {/* State Code */}
//               <div>
//                 <label htmlFor="state_code" className="block text-sm font-medium text-gray-700 mb-1">
//                   State Code <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   type="text"
//                   id="state_code"
//                   name="state_code"
//                   value={recipient.state_code}
//                   onChange={handleRecipientChange}
//                   className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   placeholder="NY"
//                   required
//                 />
//               </div>

//               {/* Country Code */}
//               <div>
//                 <label htmlFor="country_code" className="block text-sm font-medium text-gray-700 mb-1">
//                   Country Code <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   type="text"
//                   id="country_code"
//                   name="country_code"
//                   value={recipient.country_code}
//                   onChange={handleRecipientChange}
//                   className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   placeholder="US"
//                   required
//                 />
//               </div>

//               {/* ZIP Code */}
//               <div>
//                 <label htmlFor="zip" className="block text-sm font-medium text-gray-700 mb-1">
//                   ZIP Code <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   type="text"
//                   id="zip"
//                   name="zip"
//                   value={recipient.zip}
//                   onChange={handleRecipientChange}
//                   className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   placeholder="10001"
//                   required
//                 />
//               </div>

//               {/* Submit Button & Status */}
//               <div className="mt-6">
//                 {loading ? (
//                   <button
//                     type="button"
//                     className="w-full bg-blue-500 text-white py-2 px-4 rounded-md cursor-not-allowed flex items-center justify-center"
//                     disabled
//                   >
//                     <svg
//                       className="animate-spin h-5 w-5 mr-3 text-white"
//                       xmlns="http://www.w3.org/2000/svg"
//                       fill="none"
//                       viewBox="0 0 24 24"
//                     >
//                       <circle
//                         className="opacity-25"
//                         cx="12"
//                         cy="12"
//                         r="10"
//                         stroke="currentColor"
//                         strokeWidth="4"
//                       ></circle>
//                       <path
//                         className="opacity-75"
//                         fill="currentColor"
//                         d="M4 12a8 8 0 018-8v8H4z"
//                       ></path>
//                     </svg>
//                     Placing your order...
//                   </button>
//                 ) : (
//                   <button
//                     type="submit"
//                     className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors duration-300"
//                   >
//                     Place Order
//                   </button>
//                 )}
//               </div>

//               {/* Success Message */}
//               {successMessage && (
//                 <div className="mt-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-md">
//                   {successMessage}
//                 </div>
//               )}

//               {/* Error Message */}
//               {errorMessage && (
//                 <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md">
//                   {errorMessage}
//                 </div>
//               )}
//             </form>
//           </div>
//         </div>
//       </div>
//     </div>
//     </>
//   );
// };

// export default PlaceOrder;




