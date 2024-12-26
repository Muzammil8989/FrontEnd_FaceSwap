'use client'

import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { ShoppingCart } from 'lucide-react'
// import { useCart } from "@/context/cart-context"

const products = [
  { id: 1, name: "T-Shirt", price: 24.99, image: "https://res.cloudinary.com/djwjfeufk/image/upload/v1734733761/testing_c7o50m.jpg" },
  { id: 2, name: "Mug", price: 14.99, image: "https://res.cloudinary.com/djwjfeufk/image/upload/v1734733761/testing_c7o50m.jpg" },
  { id: 3, name: "Phone Case", price: 19.99, image: "https://res.cloudinary.com/djwjfeufk/image/upload/v1734733761/testing_c7o50m.jpg" },
  { id: 4, name: "Poster", price: 29.99, image: "https://res.cloudinary.com/djwjfeufk/image/upload/v1734733761/testing_c7o50m.jpg" },
  { id: 5, name: "Hoodie", price: 39.99, image: "https://res.cloudinary.com/djwjfeufk/image/upload/v1734733761/testing_c7o50m.jpg" },
  { id: 6, name: "Tote Bag", price: 16.99, image: "https://res.cloudinary.com/djwjfeufk/image/upload/v1734733761/testing_c7o50m.jpg" },
]

export default function Products() {
  // const { addItem } = useCart()

  return (
    <div className="min-h-screen bg-background">
      <main className="container px-4 py-12 md:px-6 mx-auto">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <img
              src="https://res.cloudinary.com/djwjfeufk/image/upload/v1734733761/testing_c7o50m.jpg"
              alt="Generated Image"
              className="max-w-md mx-auto rounded-lg"
            />
            <h2 className="text-2xl font-semibold">Available Products</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <Card key={product.id}>
                <CardContent className="p-4">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <div className="mt-4">
                    <h3 className="text-lg font-semibold">{product.name}</h3>
                    <p className="text-blue-600 font-semibold">${product.price}</p>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-2 p-4">
                  <Button 
                    className="w-full" 
                    variant="outline"
                    // onClick={() => addItem(product)}
                  >
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Add to Cart
                  </Button>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                    Buy Now
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}

