import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia' as const,
});

export async function POST(req: Request) {
  try {
    const { recipient, items } = await req.json();

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: items.map((item: any) => ({
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Custom Product', // You may want to fetch the actual product name based on variant_id
            images: [item.files[0].url],
          },
          unit_amount: 9999, // Replace with actual price, Stripe expects amount in cents
        },
        quantity: item.quantity,
      })),
      mode: 'payment',
      success_url: `${new URL(req.url!).origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${new URL(req.url!).origin}/cancel`,
      metadata: {
        orderRequest: JSON.stringify({ recipient, items }),
      },
    });

    return new Response(JSON.stringify({ sessionId: session.id, url: session.url }), {
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
