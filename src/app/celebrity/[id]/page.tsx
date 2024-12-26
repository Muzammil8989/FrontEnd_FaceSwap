'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Upload } from 'lucide-react';
import { Header } from '@/components/header';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { celebrities, Celebrity } from "@/lib/data/celebrity";
import { useCart } from "@/context/cart-context";
import { useRouter, useParams } from "next/navigation";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PlaceOrder from "@/components/placeOrder";

interface UploadResult {
  message: string;
  swapImageUrl: string;
}

interface UploadResultResponse {
  message: string;
  resultImageUrl: string;
}

interface MockupResponse {
  message: string;
  mockupUrls: Array<{
    productId: number;
    productName: string;
    mockupImageUrl: string;
  }>;
}

const initialProducts = [
  {
    id: 1,
    name: "T-Shirt",
    price: 24.99,
    baseImageUrl:
      "https://i.pinimg.com/736x/f7/1c/5c/f71c5c1e89dbb27a7e840b6fb60932eb.jpg"
  },
  {
    id: 2,
    name: "Mug",
    price: 14.99,
    baseImageUrl:
      "https://t4.ftcdn.net/jpg/08/84/82/13/360_F_884821388_aPtRRrn2B6KImsJ3iVobtvGRvQq1aFfO.jpg"
  },
  {
    id: 3,
    name: "Phone Case",
    price: 19.99,
    baseImageUrl:
      "https://images.rawpixel.com/image_800/cHJpdmF0ZS9sci9pbWFnZXMvd2Vic2l0ZS8yMDIzLTA4L3Jhd3BpeGVsb2ZmaWNlOV9waG90b2dyYXBoX2FfbWluaW1hbGlzdF93aGl0ZV9zbWFydHBob25lX2Nhc2Vfc183ZmFkODY1NS03ZDBjLTQ4NmMtOGFkNy04OWEzNjNmNzcwZGNfMS5qcGc.jpg"
  },
  {
    id: 4,
    name: "Poster",
    price: 29.99,
    baseImageUrl:
      "https://img.freepik.com/premium-vector/hanging-poster-vector-mockup-png-poster-advertising-blank-template-white-blank-poster-png_156846-1937.jpg"
  }
];

export default function CelebrityPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { addToCart } = useCart();

  const celebrity: Celebrity | undefined = celebrities.find(
    (celeb) => celeb.id === Number(id)
  );

  // FaceSwap States
  const [targetImageUrl, setTargetImageUrl] = useState<string>("");
  const [, setSwapImageUrl] = useState<string>("");
  const [loadingMessage, setLoadingMessage] = useState<string>("");
  const [resultUrl, setResultUrl] = useState<string>("");

  // Swap Image Upload States
  const [swapFile, setSwapFile] = useState<File | null>(null);
  const [swapPreview, setSwapPreview] = useState<string | null>(null);
  const [isSwapping, setIsSwapping] = useState(false);
  const [progress] = useState(0);

  // Mockups State
  const [mockups, setMockups] = useState<
    Array<{ id: number; name: string; image: string }>
  >([]);

  // Ensure that the celebrity exists
  useEffect(() => {
    if (celebrity) {
      setTargetImageUrl(celebrity.image);
    } else {
      toast.error("Celebrity not found.");
      router.push("/");
    }
  }, [celebrity, router]);

  // Handle file change for swap image
  const handleSwapFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setSwapFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setSwapPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      toast.error("Please upload a valid image file.");
    }
  };

  // Handle Face Swap
  const handleFaceSwap = async () => {
    if (!swapFile) {
      toast.error("Please upload a swap image.");
      return;
    }

    const targetFaceIndex = "1";
    const token = process.env.NEXT_PUBLIC_MAGICAPI_KEY;

    if (!targetFaceIndex) {
      toast.error("Please provide the target face index.");
      return;
    }

    setIsSwapping(true);
    setLoadingMessage("Uploading swap image...");

    const formData = new FormData();
    formData.append("swapImage", swapFile);

    let uploadResult: UploadResult;
    try {
      const uploadResponse = await fetch("http://localhost:5000/uploadSwap", {
        method: "POST",
        body: formData
      });

      uploadResult = await uploadResponse.json();
      if (uploadResponse.ok) {
        setSwapImageUrl(uploadResult.swapImageUrl);
      } else {
        toast.error(uploadResult.message || "Error uploading swap image.");
        setIsSwapping(false);
        setLoadingMessage("");
        return;
      }
    } catch (error) {
      console.error("Error uploading swap image:", error);
      toast.error("Error uploading swap image.");
      setIsSwapping(false);
      setLoadingMessage("");
      return;
    }

    const requestData = new URLSearchParams({
      target_url: targetImageUrl,
      swap_url: uploadResult.swapImageUrl,
      target_face_index: targetFaceIndex
    });

    setLoadingMessage("Initiating face swap...");

    try {
      const response = await fetch(
        "https://api.magicapi.dev/api/v1/capix/faceswap/faceswap/v1/image",
        {
          method: "POST",
          headers: {
            accept: "application/json",
            "x-magicapi-key": token || "",
            "Content-Type": "application/x-www-form-urlencoded"
          },
          body: requestData.toString()
        }
      );

      const responseData = await response.json();

      if (!response.ok) {
        toast.error("Error: " + (responseData.message || "Unknown error"));
        setIsSwapping(false);
        setLoadingMessage("");
        return;
      }

      const requestId = responseData?.image_process_response?.request_id;

      if (requestId) {
        setLoadingMessage("Processing... Please wait.");
        await pollResult(requestId, token || "");
      } else {
        toast.error("Error: No request ID received.");
        setLoadingMessage("");
        setIsSwapping(false);
      }
    } catch (error) {
      console.error("Error during API request:", error);
      toast.error("Error during face swap process.");
      setIsSwapping(false);
      setLoadingMessage("");
    }
  };

  // Poll API for result
  const pollResult = async (requestId: string, token: string) => {
    try {
      const maxAttempts = 10;
      let attempts = 0;
      const interval = setInterval(async () => {
        attempts += 1;
        try {
          const resultResponse = await fetch(
            "https://api.magicapi.dev/api/v1/capix/faceswap/result/",
            {
              method: "POST",
              headers: {
                accept: "application/json",
                "x-magicapi-key": token
              },
              body: new URLSearchParams({
                request_id: requestId
              })
            }
          );

          const resultData = await resultResponse.json();

          if (!resultResponse.ok) {
            setLoadingMessage("Error fetching result.");
            clearInterval(interval);
            setIsSwapping(false);
            toast.error("Error fetching face swap result.");
            return;
          }

          const outputUrl = resultData?.image_process_response?.result_url;

          if (outputUrl) {
            setResultUrl(outputUrl);
            setLoadingMessage("");
            setIsSwapping(false);
            clearInterval(interval);

            // Upload the swapped image
            await uploadResultImage(outputUrl);
          } else {
            // Continue polling
            console.log("Still processing...");
            if (attempts >= maxAttempts) {
              setLoadingMessage(
                "Processing taking longer than expected. Please try again later."
              );
              clearInterval(interval);
              setIsSwapping(false);
              toast.error("Face swap is taking longer than expected.");
            }
          }
        } catch (error) {
          setLoadingMessage("Error fetching result.");
          console.error(error);
          clearInterval(interval);
          setIsSwapping(false);
          toast.error("Error fetching face swap result.");
        }
      }, 2000);
    } catch (error) {
      setLoadingMessage("Error fetching result.");
      console.error(error);
      setIsSwapping(false);
      toast.error("Error fetching face swap result.");
    }
  };

  // Upload final result to your server
  const uploadResultImage = async (resultUrl: string) => {
    try {
      const response = await fetch("http://localhost:5000/uploadResult", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ resultUrl })
      });

      const data: UploadResultResponse = await response.json();

      if (response.ok) {
        const { resultImageUrl } = data;
        await generateMockups(resultImageUrl);
      } else {
        toast.error(data.message || "Error uploading result image.");
      }
    } catch (error) {
      console.error("Error uploading result image:", error);
      toast.error("Error uploading result image.");
    }
  };

  // Generate mockups
  const generateMockups = async (resultImageUrl: string) => {
    try {
      const response = await fetch("http://localhost:5000/generateMockups", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          resultImageUrl,
          products: initialProducts.map((product) => ({
            id: product.id,
            name: product.name,
            baseImageUrl: product.baseImageUrl
          }))
        })
      });

      const data: MockupResponse = await response.json();

      if (response.ok) {
        const { mockupUrls } = data;
        setMockups(
          mockupUrls.map((mockup) => ({
            id: mockup.productId,
            name: mockup.productName,
            image: mockup.mockupImageUrl
          }))
        );
        toast.success("Mockups generated successfully!");
      } else {
        toast.error(data.message || "Error generating mockups.");
      }
    } catch (error) {
      console.error("Error generating mockups:", error);
      toast.error("Error generating mockups.");
    }
  };

  // Add product to cart
  const handleAddToCart = (mockup: { id: number; name: string; image: string }) => {
    const product = initialProducts.find((p) => p.id === mockup.id);
    if (product) {
      addToCart({
        id: product.id,
        name: product.name,
        image: mockup.image,
        price: product.price,
        quantity: 1
      });
      toast.success(`${product.name} added to cart!`);
    } else {
      toast.error("Product details not found.");
    }
  };

  return (
    <>
      <ToastContainer />
      <div className="min-h-screen md:h-[calc(100vh-64px)] bg-zinc-500 mt-4 text-zinc-800 flex flex-col">
        <main className="container mx-auto px-4 py-8 flex-grow flex flex-col items-center space-y-10">
          {/* Page Title */}
          <h1 className="text-3xl md:text-4xl font-bold text-center">
            Celebrity Face Swap with {celebrity?.name}
          </h1>

          {/* Section: Images and Uploader */}
          <div className="flex flex-col md:flex-row md:items-end md:gap-6 w-full max-w-5xl">
            {/* Target Celebrity Image */}
            {targetImageUrl && (
              <div className="md:w-1/2 flex flex-col items-center mb-6 md:mb-0">
                <img
                  src={targetImageUrl}
                  alt="Target Celebrity"
                  className="w-full h-72 object-cover rounded-lg shadow"
                />
              </div>
            )}

            {/* Uploader */}
            <div className="md:w-1/2 flex flex-col items-center md:items-end">
              {!swapPreview ? (
                <div className="border-2 border-dashed border-zinc-300 rounded-lg p-8 text-center space-y-4 w-full max-w-md">
                  <Upload className="mx-auto h-12 w-12 text-zinc-400" />
                  <div>
                    <label
                      htmlFor="swap-file-upload"
                      className="cursor-pointer text-zinc-600 hover:text-zinc-800 transition-colors"
                    >
                      Click to upload your image
                    </label>
                    <input
                      id="swap-file-upload"
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleSwapFileChange}
                    />
                    <p className="text-sm text-zinc-500">or drag and drop</p>
                    <p className="text-xs text-zinc-400">
                      PNG, JPG or GIF (MAX. 10MB)
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 w-full max-w-md">
                  <img
                    src={swapPreview}
                    alt="Swap Preview"
                    className="w-full h-72 object-cover rounded-lg shadow"
                  />
                  <Button
                    onClick={() => {
                      setSwapPreview(null);
                      setSwapFile(null);
                      setSwapImageUrl("");
                      setResultUrl("");
                      setMockups([]);
                    }}
                    variant="outline"
                    className="w-full bg-white border border-zinc-300 text-zinc-800 hover:bg-zinc-100"
                  >
                    Remove
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Face Swap Button */}
          {swapPreview && (
            <div>
              <Button
                onClick={handleFaceSwap}
                disabled={isSwapping}
                className="bg-zinc-900 hover:bg-zinc-800 text-white px-6 py-3 rounded-md transition-all"
              >
                {isSwapping ? "Swapping..." : "Swap Faces"}
              </Button>
            </div>
          )}

          {/* Loading/Progress */}
          {loadingMessage && (
            <div className="w-full max-w-md flex flex-col items-center space-y-2">
              <Progress value={progress / 100} className="w-full" />
              <p className="text-sm text-zinc-600">{loadingMessage}</p>
            </div>
          )}

          {/* Swapped Result */}
          {resultUrl && (
            <div className="space-y-4 flex flex-col items-center">
              <h2 className="text-2xl font-semibold">Swapped Image</h2>
              <img
                src={resultUrl}
                alt="Swapped Face"
                className="w-full max-w-md h-72 object-cover rounded-lg shadow"
              />
              <a
                href={resultUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-zinc-900 hover:bg-zinc-800 text-white px-4 py-2 rounded-md transition-all"
              >
                View Full Image
              </a>
            </div>
          )}

          {/* Place Order Section */}
          {/* {resultUrl && <PlaceOrder imageUrl={resultUrl} />} */}

          {/* Generated Mockups */}
          {mockups.length > 0 && (
            <div className="w-full max-w-5xl mt-10">
              <h2 className="text-2xl font-semibold mb-4">
                Available Products
              </h2>
              <Carousel
                opts={{
                  align: "start",
                  loop: true
                }}
                className="w-full"
              >
                <CarouselContent className="flex space-x-4">
                  {mockups.map((mockup) => (
                    <CarouselItem
                      key={mockup.id}
                      className="basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4"
                    >
                      <div className="p-4 rounded-lg shadow bg-white flex flex-col items-center space-y-3">
                        <img
                          src={mockup.image}
                          alt={`${mockup.name} Mockup`}
                          className="w-full h-48 object-cover rounded-md"
                        />
                        <h3 className="text-lg font-semibold">{mockup.name}</h3>
                        <p className="font-semibold text-zinc-700">
                          $
                          {initialProducts
                            .find((p) => p.id === mockup.id)
                            ?.price.toFixed(2)}
                        </p>
                        <Button
                          onClick={() => handleAddToCart(mockup)}
                          className="bg-zinc-900 hover:bg-zinc-800 text-white px-4 py-2 rounded-md transition-all"
                        >
                          Add to Cart
                        </Button>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="hidden md:flex" />
                <CarouselNext className="hidden md:flex" />
              </Carousel>
            </div>
          )}
        </main>
      </div>
    </>
  );
}
