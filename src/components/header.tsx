// src/components/header.tsx

'use client';

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ShoppingCart, Plus, Minus, X, Menu } from 'lucide-react';
import { useCart, CartItem } from "@/context/cart-context";
import { useState } from "react";

export function Header() {
  const { items, removeItem, updateQuantity, clearCart, subtotal } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const [isNavOpen, setIsNavOpen] = useState(false);

  return (
    <header className="border-b flex items-center justify-center">
      <div className="w-full max-w-6xl flex h-16 justify-between items-center px-4 md:px-6">
        {/* Branding */}
        <Link href="/" className="flex justify-center items-center gap-2">
          <img
            src="https://t4.ftcdn.net/jpg/03/27/42/19/360_F_327421961_Yc82wWsqdKhuncYiEIPXCQedziX6k8L9.jpg"
            className="w-12 md:w-16"
            alt="AI Selfie Generator Logo"
          />
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-4">
          <Link href="/gallery" className="text-sm font-medium hover:underline">
            Gallery
          </Link>
          <Link href="/contact" className="text-sm font-medium hover:underline">
            Contact/Support
          </Link>
          <Link href="/about" className="text-sm font-medium hover:underline">
            About Us
          </Link>
          <Link href="/faq" className="text-sm font-medium hover:underline">
            FAQ
          </Link>
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="relative">
                <ShoppingCart className="h-5 w-5" />
                {items.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
                    {items.reduce((sum: number, item: CartItem) => sum + item.quantity, 0)}
                  </span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent className="w-full sm:max-w-lg">
              <SheetHeader>
                <SheetTitle>Your Cart</SheetTitle>
              </SheetHeader>
              <div className="mt-8 flex-1 overflow-y-auto">
                {items.length === 0 ? (
                  <p className="text-center text-muted-foreground">Your cart is empty</p>
                ) : (
                  <div className="space-y-4">
                    {items.map((item) => (
                      <div key={item.id} className="flex items-center gap-4">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-16 w-16 rounded-lg object-cover"
                        />
                        <div className="flex-1">
                          <h3 className="font-medium">{item.name}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="rounded-full p-1 hover:bg-gray-100"
                              aria-label={`Decrease quantity of ${item.name}`}
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <span>{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="rounded-full p-1 hover:bg-gray-100"
                              aria-label={`Increase quantity of ${item.name}`}
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-red-500 hover:text-red-600"
                            aria-label={`Remove ${item.name} from cart`}
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {items.length > 0 && (
                <div className="border-t pt-4 mt-4 space-y-4">
                  <div className="flex justify-between">
                    <span className="font-medium">Subtotal</span>
                    <span className="font-medium">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex gap-4">
                    <Button
                      variant="destructive"
                      className="flex-1"
                      onClick={clearCart}
                    >
                      Delete All
                    </Button>
                    <Link href="/checkout">
                      <Button className="flex-1 bg-zinc-900 hover:bg-zinc-800">
                        Checkout
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </SheetContent>
          </Sheet>
        </nav>

        {/* Mobile Navigation */}
        <div className="flex md:hidden items-center">
          <Button variant="outline" size="icon" onClick={() => setIsNavOpen(!isNavOpen)}>
            <Menu className="h-5 w-5" />
          </Button>
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="relative ml-4">
                <ShoppingCart className="h-5 w-5" />
                {items.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
                    {items.reduce((sum: number, item: CartItem) => sum + item.quantity, 0)}
                  </span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent className="w-full sm:max-w-lg">
              {/* You can replicate the cart logic here or keep it empty */}
              <SheetHeader>
                <SheetTitle>Your Cart</SheetTitle>
              </SheetHeader>
              {/* ... same as above */}
              <div className="mt-8 flex-1 overflow-y-auto">
                {items.length === 0 ? (
                  <p className="text-center text-muted-foreground">Your cart is empty</p>
                ) : (
                  <div className="space-y-4">
                    {items.map((item) => (
                      <div key={item.id} className="flex items-center gap-4">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-16 w-16 rounded-lg object-cover"
                        />
                        <div className="flex-1">
                          <h3 className="font-medium">{item.name}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="rounded-full p-1 hover:bg-gray-100"
                              aria-label={`Decrease quantity of ${item.name}`}
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <span>{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="rounded-full p-1 hover:bg-gray-100"
                              aria-label={`Increase quantity of ${item.name}`}
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-red-500 hover:text-red-600"
                            aria-label={`Remove ${item.name} from cart`}
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {items.length > 0 && (
                <div className="border-t pt-4 mt-4 space-y-4">
                  <div className="flex justify-between">
                    <span className="font-medium">Subtotal</span>
                    <span className="font-medium">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex gap-4">
                    <Button
                      variant="destructive"
                      className="flex-1"
                      onClick={clearCart}
                    >
                      Delete All
                    </Button>
                    <Link href="/checkout">
                      <Button className="flex-1 bg-zinc-900 hover:bg-zinc-800">
                        Checkout
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isNavOpen && (
        <div className="absolute top-16 w-full bg-white shadow-md md:hidden">
          <nav className="flex flex-col items-center py-4 gap-4">
            <Link href="/gallery" className="text-sm font-medium hover:underline">
              Gallery
            </Link>
            <Link href="/contact" className="text-sm font-medium hover:underline">
              Contact/Support
            </Link>
            <Link href="/about" className="text-sm font-medium hover:underline">
              About Us
            </Link>
            <Link href="/faq" className="text-sm font-medium hover:underline">
              FAQ
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
