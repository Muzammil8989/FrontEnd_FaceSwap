import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia' as const,
});


export async function POST(req: Request) {
  try {
    const { sessionId } = await req.json();

    // Retrieve the Stripe session
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    // Retrieve the order request from the session metadata
    const orderRequest = JSON.parse(session.metadata?.orderRequest || '{}');

    // Send the order to your API server
    const response = await fetch("https://face-swap-backend-gamma.vercel.app/place-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderRequest),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Error placing order.");
    }

    const result = await response.json();

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ statusCode: 500, message: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
