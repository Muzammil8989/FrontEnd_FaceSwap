import { NextResponse } from "next/server";

// --- Put your product objects here ---
const product1 = {
  productId: 679,
  variant_ids: [
    17004, 17005, 17006, 17007, 17008, 17009, 17080, 17025, 17026, 17027,
    17028, 17029, 17030, 17083, 17011, 17012, 17013, 17014, 17015, 17016,
    17081, 17039, 17040, 17041, 17042, 17043, 17044, 17085, 17046, 17047,
    17048, 17049, 17050, 17051, 17086, 17074, 17075, 17076, 17077, 17078,
    17079, 17090, 17018, 17019, 17020, 17021, 17022, 17023, 17082, 17060,
    17061, 17062, 17063, 17064, 17065, 17088, 17067, 17068, 17069, 17070,
    17071, 17072, 17089, 17053, 17054, 17055, 17056, 17057, 17058, 17087,
  ],
  format: "png",
  width: 1429,
  product_options: {
    aute5c7: 30673857.225494266,
  },
  option_groups: [],
  options: [],
  files: [
    {
      placement: "front",
      image_url: "",
      position: {
        area_width: 1800,
        area_height: 2400,
        width: 1800,
        height: 1800,
        top: 300,
        left: 0,
        limit_to_print_area: true,
      },
      options: [],
    },
  ],
};

const product2 = {
  productId: 599,
  variant_ids: [
    15327, 15328, 15329, 15330, 15331, 15332, 19783, 15333, 15334, 15335,
    15336, 15337, 15338, 19784, 19777, 19778, 19779, 19780, 19794, 19781,
    19782, 19786, 19787, 19788, 19789, 19790, 19791, 19792, 15345, 15346,
    15347, 15350, 15348, 15349, 19785, 19851, 19852, 19853, 19854, 19855,
    19856, 19857,
  ],
  format: "png",
  width: 593,
  product_options: {},
  option_groups: [],
  options: [],
  files: [
    {
      placement: "embroidery_chest_left",
      image_url: "",
      position: {
        area_width: 1800,
        area_height: 2400,
        width: 1800,
        height: 1800,
        top: 300,
        left: 0,
        limit_to_print_area: true,
      },
      options: [],
    },
  ],
};

const product3 = {
  productId: 638,
  variant_ids: [16244, 16245],
  format: "png",
  width: 1937,
  product_options: {},
  option_groups: [],
  options: [],
  files: [
    {
      placement: "embroidery_front_large",
      image_url: "",
      position: {
        area_width: 1800,
        area_height: 2400,
        width: 1800,
        height: 1800,
        top: 300,
        left: 0,
        limit_to_print_area: true,
      },
      options: [],
    },
    // Example of an optional second placement:
    // {
    //   placement: "embroidery_back",
    //   image_url: "",
    //   position: {
    //     area_width: 687,
    //     area_height: 344,
    //     width: 687,
    //     height: 344,
    //     top: 1240,
    //     left: 1156,
    //   },
    //   options: [],
    // },
    {
      placement: "embroidery_left",
      image_url: "",
      position: {
        area_width: 542,
        area_height: 271,
        width: 542,
        height: 271,
        top: 229,
        left: 93,
      },
      options: [],
    },
  ],
};

const PRINTFUL_API_KEY = process.env.PRINTFUL_ACCESS_TOKEN || "";

export async function POST(request: Request) {
  if (!PRINTFUL_API_KEY) {
    return NextResponse.json(
      { error: "Missing PRINTFUL_API_KEY" },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const { imageUrl } = body;
    console.log("imageUrl:", imageUrl);

    if (!imageUrl) {
      return NextResponse.json(
        { error: "imageUrl is required" },
        { status: 400 }
      );
    }

    // Prepare the products
    const products = [
      { product: structuredClone(product1), productId: 679 },
      { product: structuredClone(product2), productId: 599 },
      // { product: structuredClone(product3), productId: 638 },
    ];

    // Shuffle the products array to randomize the selection
    const shuffledProducts = products.sort(() => Math.random() - 0.5);

    // Select the first two different products
    const selectedProducts = shuffledProducts.slice(0, 2);

    // Add the image URL to each product
    selectedProducts.forEach(({ product }) => {
      if (product.files && Array.isArray(product.files)) {
        product.files.forEach((f: { image_url: string }) => {
          f.image_url = imageUrl;
        });
      }
    });

    // Create mockup generation tasks for the selected products
    const tasks = await Promise.all(
      selectedProducts.map(async ({ product, productId }) => {
        const createTaskRes = await fetch(
          `https://api.printful.com/mockup-generator/create-task/${productId}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${PRINTFUL_API_KEY}`,
            },
            body: JSON.stringify({
              variant_ids: product.variant_ids,
              format: product.format,
              width: product.width,
              product_options: product.product_options,
              option_groups: product.option_groups,
              options: product.options,
              files: product.files,
            }),
          }
        );

        if (!createTaskRes.ok) {
          const text = await createTaskRes.text();
          throw new Error(`Printful error ${createTaskRes.status}: ${text}`);
        }

        const createTaskData = await createTaskRes.json();
        return createTaskData?.result?.task_key;
      })
    );

    console.log("Tasks created:", tasks);

    if (tasks.includes(undefined)) {
      return NextResponse.json(
        { error: "Failed to create mockup task for one or more products" },
        { status: 500 }
      );
    }

    // Instead of polling here, simply return tasks
    return NextResponse.json(
      {
        message: "Tasks created successfully!",
        tasks,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error creating tasks:", error);
    return NextResponse.json(
      { error: error.message || "Server error" },
      { status: 500 }
    );
  }
}