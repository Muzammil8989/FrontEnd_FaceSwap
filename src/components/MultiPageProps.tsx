"use client";

import React, { useState, FormEvent } from "react";

interface MultiPageProps {
  imageUrlProp?: string; // Accept `imageUrlProp` as a prop
}

export default function MultiPage({ imageUrlProp = "" }: MultiPageProps) {
  const [productChoice, setProductChoice] = useState("product1");
  const [imageUrl, setImageUrl] = useState(imageUrlProp); // Initialize state with the prop value

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<any>(null);

  // Example "Buy Now" handler
  const handleBuyNow = (mockup: any) => {
    console.log("User clicked Buy Now for:", mockup);
    alert(`Buy Now clicked!\nVariant: ${mockup.variant_id}\nImage: ${mockup.image_url}`);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setResult(null);
    setLoading(true);

    try {
      const res = await fetch("/api/printful/multiMockups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productChoice, imageUrl }),
      });
      console.log("Response:", res);
      

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Error creating mockups");
      }

      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Create Mockups (Three Products)</h1>

      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        {/* 1) Select product */}
        res
        <div>
          <label className="block font-medium mb-1">Select Product Config:</label>
          <select
            className="p-2 border border-gray-300 rounded"
            value={productChoice}
            onChange={(e) => setProductChoice(e.target.value)}
          >
            <option value="product1">Product #1 (ID=679)</option>
            <option value="product2">Product #2 (ID=599)</option>
            <option value="product3">Product #3 (ID=638)</option>
          </select>
        </div>

        {/* 2) Image URL */}
        <div>
          <label className="block font-medium mb-1">Design Image URL:</label>
          <input
            type="text"
            className="w-full p-2 border border-gray-300 rounded"
            placeholder="https://example.com/your-design.png"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
          />
        </div>

        {/* 3) Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className={`px-4 py-2 text-white rounded ${
            loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading ? "Generating Mockups..." : "Create Mockups"}
        </button>
      </form>

      {/* Error Display */}
      {error && <div className="text-red-600 mt-4">{error}</div>}

      {/* Result Display */}
      {result && (
        <div className="bg-gray-100 p-3 mt-6 rounded">
          {/* <h2 className="font-semibold mb-2">Server Response:</h2>
          <pre className="text-sm whitespace-pre-wrap">
            {JSON.stringify(result, null, 2)}
          </pre> */}

          {/* If the server returned mockups, display them */}
          {Array.isArray(result.mockups) && result.mockups.length > 0 && (
            <div className="mt-6">
              <h3 className="font-semibold mb-2 text-lg">Generated Mockups</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {result.mockups.map((mk: any, i: number) => (
                  <div key={i} className="bg-white p-4 rounded shadow">
                    <p className="text-sm text-gray-700 font-semibold mb-2">
                      Variant ID: {mk.variant_id}
                    </p>
                    {/* Display the mockup image */}
                    <img
                      src={mk.mockup_url}
                      alt={`Mockup ${i}`}
                      className="w-full h-auto rounded"
                    />
                    <p className="mt-2 text-xs text-gray-400">
                      Placement: {mk.placement}
                    </p>

                    {/* "Buy Now" Button */}
                    <button
                      onClick={() => handleBuyNow(mk)}
                      className="mt-3 bg-green-600 hover:bg-green-700 text-white py-1 px-3 rounded text-sm"
                    >
                      Buy Now
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}











// "use client";

// import { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";
// import {
//   Carousel,
//   CarouselContent,
//   CarouselItem,
//   CarouselNext,
//   CarouselPrevious,
// } from "@/components/ui/carousel";
// import { Button } from "@/components/ui/button";
// import { Progress } from "@/components/ui/progress";
// import { Card, CardContent } from "@/components/ui/card";
// import { Upload } from "lucide-react";
// import { Header } from "@/components/header";
// import { celebrities, Celebrity } from "@/lib/data/celebrity";
// import { toast, ToastContainer } from "react-toastify";
// import { useCart } from "@/context/cart-context";
// import PlaceOrder from "@/components/placeOrder";
// import { motion } from "framer-motion";


// import "react-toastify/dist/ReactToastify.css";

// // Import ClipLoader from react-spinners
// import ClipLoader from "react-spinners/ClipLoader";

// // Dummy product list for generating mockups
// const initialProducts = [
//   {
//     id: 1,
//     name: "T-Shirt",
//     price: 24.99,
//     baseImageUrl:
//       "https://i.pinimg.com/736x/f7/1c/5c/f71c5c1e89dbb27a7e840b6fb60932eb.jpg",
//   },
//   {
//     id: 2,
//     name: "Mug",
//     price: 14.99,
//     baseImageUrl:
//       "https://t4.ftcdn.net/jpg/08/84/82/13/360_F_884821388_aPtRRrn2B6KImsJ3iVobtvGRvQq1aFfO.jpg",
//   },
//   {
//     id: 3,
//     name: "Phone Case",
//     price: 19.99,
//     baseImageUrl:
//       "https://images.rawpixel.com/image_800/cHJpdmF0ZS9sci9pbWFnZXMvd2Vic2l0ZS8yMDIzLTA4L3Jhd3BpeGVsb2ZmaWNlOV9waG90b2dyYXBoX2FfbWluaW1hbGlzdF93aGl0ZV9zbWFydHBob25lX2Nhc2Vfc183ZmFkODY1NS03ZDBjLTQ4NmMtOGFkNy04OWEzNjNmNzcwZGNfMS5qcGc.jpg",
//   },
//   {
//     id: 4,
//     name: "Poster",
//     price: 29.99,
//     baseImageUrl:
//       "https://img.freepik.com/premium-vector/hanging-poster-vector-mockup-png-poster-advertising-blank-template-white-blank-poster-png_156846-1937.jpg",
//   },
// ];

// interface UploadResult {
//   message: string;
//   swapImageUrl: string;
// }

// interface UploadResultResponse {
//   message: string;
//   resultImageUrl: string;
// }

// interface MockupResponse {
//   message: string;
//   mockupUrls: Array<{
//     productId: number;
//     productName: string;
//     mockupImageUrl: string;
//   }>;
// }

// export default function Celebrities() {
//   const router = useRouter();
//   const { addToCart } = useCart();

//   // -------------------------------
//   // Step 1: Select Template
//   // -------------------------------
//   const [selectedCelebrity, setSelectedCelebrity] = useState<Celebrity | null>(
//     null
//   );

//   // Handler when user selects a celebrity from carousel
//   const handleSelectTemplate = (celeb: Celebrity) => {
//     setSelectedCelebrity(celeb);
//     // Clear everything if user reselects
//     resetSwapState();
//   };

//   // Reset everything
//   const resetSwapState = () => {
//     setSwapFile(null);
//     setSwapPreview(null);
//     setSwapImageUrl("");
//     setResultUrl("");
//     setMockups([]);
//     setLoadingMessage("");
//     setIsSwapping(false);
//     setIsGeneratingMockups(false); // Reset mockup generation state
//   };

//   // -------------------------------
//   // Step 2: Upload Image
//   // -------------------------------
//   const [swapFile, setSwapFile] = useState<File | null>(null);
//   const [swapPreview, setSwapPreview] = useState<string | null>(null);

//   // For display
//   const [fileName, setFileName] = useState<string>("");

//   // Used to store the final swapped image URL
//   const [swapImageUrl, setSwapImageUrl] = useState<string>("");

//   // For progress bar & loading messages
//   const [progress, setProgress] = useState(0);
//   const [loadingMessage, setLoadingMessage] = useState<string>("");

//   // Step 3: Generating...
//   const [isSwapping, setIsSwapping] = useState(false);
//   const [isGeneratingMockups, setIsGeneratingMockups] = useState(false); // New state for mockup generation

//   // Step 4: Final Image + Mockups
//   const [resultUrl, setResultUrl] = useState<string>("");
//   const [mockups, setMockups] = useState<
//     Array<{ id: number; name: string; image: string }>
//   >([]);

//   // Handle file selection
//   const handleSwapFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (!file) return;
//     if (!file.type.startsWith("image/")) {
//       toast.error("Please upload a valid image file (PNG/JPG/GIF).");
//       return;
//     }
//     setSwapFile(file);
//     setFileName(file.name);

//     const reader = new FileReader();
//     reader.onloadend = () => {
//       setSwapPreview(reader.result as string);
//     };
//     reader.readAsDataURL(file);
//   };

//   // Face Swap workflow
//   const handleFaceSwap = async () => {
//     if (!swapFile) {
//       toast.error("Please upload a valid image first.");
//       return;
//     }
//     if (!selectedCelebrity) {
//       toast.error("Please select a template first.");
//       return;
//     }

//     // You can adjust if your API requires a certain face index
//     const targetFaceIndex = "1";
//     const token = process.env.NEXT_PUBLIC_MAGICAPI_KEY || "";

//     setIsSwapping(true);
//     setLoadingMessage("Uploading swap image...");
//     setProgress(10);

//     // 1) Upload the user's face
//     let uploadResult: UploadResult;
//     try {
//       const formData = new FormData();
//       formData.append("swapImage", swapFile);

//       const uploadResponse = await fetch("http://localhost:5000/uploadSwap", {
//         method: "POST",
//         body: formData,
//       });
//       uploadResult = await uploadResponse.json();

//       if (!uploadResponse.ok) {
//         toast.error(uploadResult.message || "Error uploading swap image.");
//         setIsSwapping(false);
//         setLoadingMessage("");
//         return;
//       }
//       setSwapImageUrl(uploadResult.swapImageUrl);
//     } catch (error) {
//       console.error("Error uploading swap image:", error);
//       toast.error("Error uploading swap image.");
//       setIsSwapping(false);
//       setLoadingMessage("");
//       return;
//     }

//     setProgress(30);
//     setLoadingMessage("Initiating face swap...");

//     // 2) Call MagicAPI face-swap
//     const requestData = new URLSearchParams({
//       target_url: selectedCelebrity.image,
//       swap_url: uploadResult.swapImageUrl,
//       target_face_index: targetFaceIndex,
//     });

//     try {
//       const response = await fetch(
//         "https://api.magicapi.dev/api/v1/capix/faceswap/faceswap/v1/image",
//         {
//           method: "POST",
//           headers: {
//             accept: "application/json",
//             "x-magicapi-key": token,
//             "Content-Type": "application/x-www-form-urlencoded",
//           },
//           body: requestData.toString(),
//         }
//       );
//       const responseData = await response.json();

//       if (!response.ok) {
//         toast.error("Error: " + (responseData.message || "Unknown error"));
//         setIsSwapping(false);
//         setLoadingMessage("");
//         return;
//       }

//       const requestId = responseData?.image_process_response?.request_id;
//       if (!requestId) {
//         toast.error("Error: No request ID received.");
//         setLoadingMessage("");
//         setIsSwapping(false);
//         return;
//       }

//       setLoadingMessage("Processing... Please wait.");
//       setProgress(50);

//       await pollResult(requestId, token);
//     } catch (error) {
//       console.error("Error during API request:", error);
//       toast.error("Error during face swap process.");
//       setIsSwapping(false);
//       setLoadingMessage("");
//     }
//   };

//   // Poll for face swap result
//   const pollResult = async (requestId: string, token: string) => {
//     try {
//       const maxAttempts = 10;
//       let attempts = 0;

//       const interval = setInterval(async () => {
//         attempts += 1;
//         try {
//           const resultResponse = await fetch(
//             "https://api.magicapi.dev/api/v1/capix/faceswap/result/",
//             {
//               method: "POST",
//               headers: {
//                 accept: "application/json",
//                 "x-magicapi-key": token,
//               },
//               body: new URLSearchParams({ request_id: requestId }),
//             }
//           );
//           const resultData = await resultResponse.json();

//           if (!resultResponse.ok) {
//             setLoadingMessage("Error fetching result.");
//             clearInterval(interval);
//             setIsSwapping(false);
//             toast.error("Error fetching face swap result.");
//             return;
//           }

//           const outputUrl = resultData?.image_process_response?.result_url;
//           if (outputUrl) {
//             clearInterval(interval);
//             setResultUrl(outputUrl);
//             setLoadingMessage("");
//             setProgress(100);

//             // After we get the final image, upload it to your server
//             await uploadResultImage(outputUrl);
//           } else {
//             // keep polling
//             console.log("Still processing...");
//             if (attempts >= maxAttempts) {
//               setLoadingMessage(
//                 "Processing is taking longer than expected. Please try again later."
//               );
//               clearInterval(interval);
//               setIsSwapping(false);
//               toast.error("Face swap took too long. Try again.");
//             }
//           }
//         } catch (error) {
//           setLoadingMessage("Error fetching result.");
//           console.error(error);
//           clearInterval(interval);
//           setIsSwapping(false);
//           toast.error("Error fetching face swap result.");
//         }
//       }, 2000);
//     } catch (error) {
//       setLoadingMessage("Error fetching result.");
//       console.error(error);
//       setIsSwapping(false);
//       toast.error("Error fetching face swap result.");
//     }
//   };

//   // 3) Upload the final result to your server
//   const uploadResultImage = async (finalUrl: string) => {
//     try {
//       const response = await fetch("http://localhost:5000/uploadResult", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ resultUrl: finalUrl }),
//       });
//       const data: UploadResultResponse = await response.json();

//       if (response.ok) {
//         const { resultImageUrl } = data;
//         // 4) Generate mockups
//         await generateMockups(resultImageUrl);
//       } else {
//         toast.error(data.message || "Error uploading result image.");
//         setIsSwapping(false); // Ensure swapping state is reset on error
//       }
//     } catch (error) {
//       console.error("Error uploading result image:", error);
//       toast.error("Error uploading result image.");
//       setIsSwapping(false); // Ensure swapping state is reset on error
//     }
//   };

//   // 4) Generate mockups from your server
//   const generateMockups = async (resultImageUrl: string) => {
//     setIsGeneratingMockups(true); // Start mockup generation loading
//     setLoadingMessage("Generating mockups...");
//     setProgress(70); // Update progress as needed

//     try {
//       const response = await fetch("http://localhost:5000/generateMockups", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           resultImageUrl,
//           products: initialProducts.map((product) => ({
//             id: product.id,
//             name: product.name,
//             baseImageUrl: product.baseImageUrl,
//           })),
//         }),
//       });
//       const data: MockupResponse = await response.json();

//       if (response.ok) {
//         const { mockupUrls } = data;
//         // Convert mockup response into a local array
//         const generated = mockupUrls.map((mockup) => ({
//           id: mockup.productId,
//           name: mockup.productName,
//           image: mockup.mockupImageUrl,
//         }));
//         setMockups(generated);
//         toast.success("Mockups generated successfully!");
//       } else {
//         toast.error(data.message || "Error generating mockups.");
//       }
//     } catch (error) {
//       console.error("Error generating mockups:", error);
//       toast.error("Error generating mockups.");
//     } finally {
//       setIsGeneratingMockups(false); // End mockup generation loading
//       setLoadingMessage("");
//       setProgress(100);
//       setIsSwapping(false); // Ensure swapping state is reset
//     }
//   };

//   // Add product to cart
//   const handleAddToCart = (mockup: {
//     id: number;
//     name: string;
//     image: string;
//   }) => {
//     const product = initialProducts.find((p) => p.id === mockup.id);
//     if (!product) {
//       toast.error("Product not found.");
//       return;
//     }

//     addToCart({
//       id: product.id,
//       name: product.name,
//       image: mockup.image,
//       price: product.price,
//       quantity: 1,
//     });
//     toast.success(`${product.name} added to cart!`);
//   };

//   // Arrows for main "Step 1" UI.
//   // If you want real "previous/next" logic, you can implement indexing.
//   const handlePrevious = () => {
//     console.log("Previous template clicked");
//   };
//   const handleNext = () => {
//     console.log("Next template clicked");
//   };

//   return (
//     <>
//       {/* <Header /> */}
//       <ToastContainer />

//       {/* Page container */}
//       <div className="min-h-screen mt-4 flex flex-col pb-10">
//         {/* Title and Subtitle */}
//         <div className="flex flex-col items-center justify-center pt-8">
//           <h1 className="text-3xl font-bold">Donald Trump Selfie Templates</h1>
//           <p className="text-lg text-gray-600 mb-6">
//             Select a template to start
//           </p>

//           {/* Actual Carousel for celebrities */}
//           <div className="max-w-7xl w-full mb-12 px-4">
//             <Carousel
//               opts={{
//                 align: "start",
//                 loop: true,
//               }}
//               className="w-full mx-auto"
//             >
//               <CarouselContent className="flex space-x-4">
//                 {celebrities.map((celebrity) => (
//                   <CarouselItem
//                     key={celebrity.id}
//                     className="basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4 py-8"
//                   >
//                     <Card
//                       className={`cursor-pointer transition-transform hover:scale-105 ${
//                         selectedCelebrity?.id === celebrity.id
//                           ? "border-4 border-black border-opacity-500"
//                           : ""
//                       }`}
//                       onClick={() => handleSelectTemplate(celebrity)}
//                     >
//                       <CardContent className="flex flex-col items-center justify-center p-4">
//                         <img
//                           src={celebrity.image}
//                           alt={celebrity.name}
//                           className="w-full h-64 object-cover rounded-lg"
//                         />
//                         <h3 className="mt-4 text-xl font-medium">
//                           {celebrity.name}
//                         </h3>
//                       </CardContent>
//                     </Card>
//                   </CarouselItem>
//                 ))}
//               </CarouselContent>
//               <CarouselPrevious className="hidden md:flex" />
//               <CarouselNext className="hidden md:flex" />
//             </Carousel>
//           </div>
//         </div>

//         {/* Step 2: Upload Your Image */}
//         <div className="flex flex-col items-center mb-10">
//           <div className="text-2xl font-semibold mb-2">
//             Step 2. Upload Your Image
//           </div>
//           <p className="text-lg text-gray-600 mb-4">
//             File size should not exceed 10MB
//           </p>

//           {/* Upload container - replicating the "box" style from screenshot */}
//           <div className="bg-gray-200 p-8 rounded-md  md:w-[600px]">
//             {/* "Choose File" label + input */}
//             <div className="mb-6">
//               <label className="block font-medium text-gray-800 mb-2">
//                 Choose File
//               </label>
//               <input
//                 type="file"
//                 accept="image/*"
//                 onChange={handleSwapFileChange}
//                 className="block w-full text-lg text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-white p-2"
//               />
//             </div>

//             {/* <file_name> */}
//             <div className="text-gray-600 text-lg italic mb-6">
//               {fileName ? fileName : "<file_name>"}
//             </div>

//             {/* <Your Image> */}
//             <div className="w-full h-60 bg-white rounded-md flex items-center justify-center overflow-hidden border border-gray-300">
//               {swapPreview ? (
//                 <img
//                   src={swapPreview}
//                   alt="User Preview"
//                   className="h-full w-auto object-contain"
//                 />
//               ) : (
//                 <span className="text-gray-400 text-lg">{"<Your Image>"}</span>
//               )}
//             </div>
//           </div>
//           {/* If user hasn't chosen a file but clicked "Start Generating" */}
//           {!swapPreview && (
//             <p className="text-red-500 text-lg mt-4">
//               Please upload an image first
//             </p>
//           )}

//           {/* "Start Generating" or "Swap Faces" button */}
//           <button
//             onClick={handleFaceSwap}
//             disabled={!swapPreview}
//             className={`mt-6 px-6 py-3 rounded border ${
//               swapPreview
//                 ? "bg-gray-800 text-white hover:bg-gray-700"
//                 : "bg-gray-400 text-white cursor-not-allowed"
//             } transition-colors duration-300`}
//           >
//             {isSwapping ? "Generating..." : "Start Generating"}
//           </button>
//         </div>

//         {/* Loading Animations */}
//         {(isSwapping || isGeneratingMockups) && (
//           <div className="flex flex-col items-center mb-10">
//             <div className="text-lg text-gray-700 font-medium text-center mb-4">
//               {isGeneratingMockups
//                 ? "Generating mockups..."
//                 : "Generating... It takes 5-10 seconds to generate"}
//             </div>
//             {/* Loading/Progress */}
//             <div className="w-96 mt-4">
//               <Progress value={progress / 100} />
//             </div>
//             <div className="mt-2 text-md text-gray-500">{loadingMessage}</div>
//             {/* Loading Animation using react-spinners */}
//             <div className="mt-6">
//               <ClipLoader color="#00000" loading={true} size={50} />
//             </div>
//           </div>
//         )}

//         {/* Step: Your Image Is Ready */}
//         {resultUrl && (
//           <>
//             <hr className="w-full border-gray-300 mb-10" />
//             <div className="flex flex-col items-center">
//               <h2 className="text-3xl font-bold mb-6">
//                 Your Image is Ready!!!
//               </h2>
//               <div className="w-96 h-80 bg-gray-200 border border-gray-300 rounded-md flex items-center justify-center mb-12 relative">
//                 <img
//                   src={resultUrl}
//                   alt="Swapped Face"
//                   className="max-h-full max-w-full object-contain"
//                 />
//                 <span className="absolute bottom-4 left-14 my-6 text-sm text-red-500 italic transform rotate-45">
//                   {"@LaraibRabbani"}
//                 </span>
//               </div>
//             </div>

//             {/* Place Order Section (if you use it) */}
//             {/* <PlaceOrder imageUrl={resultUrl} /> */}

//             {/* "Captured the moment? shop personalized merch now!" */}
//             {mockups.length > 0 && (
//               <div className="text-center mt-12">
//                 <p className="text-xl text-gray-700 font-medium mb-6">
//                   Captured the moment? Take it home—shop personalized merch now!
//                 </p>

//                 {/* Product carousel */}
//                 <div className=" w-full mb-12 px-4 mx-auto container">

//                 {/* Carousel */}
//                 <Carousel
//                   opts={{
//                     align: "start",
//                     loop: true,
//                   }}
                 
//                 >
//                   <CarouselContent className="flex space-x-4">
//                     {mockups.map((mockup) => (
//                       <CarouselItem
//                         key={mockup.id}
//                         className="basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4"
//                       >
//                         <motion.div
//                           whileHover={{ scale: 1.05 }}
//                           whileTap={{ scale: 0.95 }}
//                           className="transition-transform"
//                         >
//                           <div
//                             className="w-full h-full bg-gray-200 flex flex-col justify-between items-center p-6 border border-gray-300 rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-transform duration-300 cursor-pointer"
//                             onClick={() =>
//                               router.push(
//                                 `/placeorder?mockupUrl=${mockup.image}&swappedUrl=${resultUrl}&price=56.0&productName=T-Shirt`
//                               )
//                             }
//                           >
//                             <div className="text-lg text-gray-500 mb-2">
//                               {"<Product " + mockup.id + " >"}
//                             </div>
//                             <img
//                               src={mockup.image}
//                               alt={mockup.name}
//                               className="w-full h-52 object-contain rounded mb-4"
//                             />
//                             <button className="bg-gray-800 text-white px-6 py-3 text-lg rounded hover:bg-gray-700 transition-colors duration-300">
//                               Buy Now
//                             </button>
//                           </div>
//                         </motion.div>
//                       </CarouselItem>
//                     ))}
//                   </CarouselContent>

//                   {/* Navigation */}
//                   <CarouselPrevious className="hidden md:flex" />
//                   <CarouselNext className="hidden md:flex" />
//                 </Carousel>

//                 </div>
//               </div>
//             )}
//           </>
//         )}
//       </div>
//     </>
//   );
// }