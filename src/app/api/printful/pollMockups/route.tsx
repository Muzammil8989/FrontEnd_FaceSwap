import { NextResponse } from "next/server";

const PRINTFUL_API_KEY = process.env.PRINTFUL_ACCESS_TOKEN || "";

// A small helper to wait/pause
function wait(ms: number): Promise<void> {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

export async function POST(request: Request) {
  if (!PRINTFUL_API_KEY) {
    return NextResponse.json(
      { error: "Missing PRINTFUL_API_KEY" },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const { tasks } = body; // tasks is an array of task_keys

    if (!Array.isArray(tasks) || tasks.length === 0) {
      return NextResponse.json(
        { error: "No tasks were provided" },
        { status: 400 }
      );
    }

    console.log("Polling tasks:", tasks);

    const maxAttempts = 10;
    const pollIntervalMs = 3000; // 3 seconds
    let attempts = 0;

    while (attempts < maxAttempts) {
      attempts++;
      await wait(pollIntervalMs);

      // Check the status of each task
      const taskStatusResponses = await Promise.all(
        tasks.map(async (taskKey) => {
          const checkRes = await fetch(
            `https://api.printful.com/mockup-generator/task?task_key=${taskKey}`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${PRINTFUL_API_KEY}`,
              },
            }
          );

          if (!checkRes.ok) {
            const checkErr = await checkRes.text();
            throw new Error(`Error checking task status: ${checkErr}`);
          }

          return await checkRes.json();
        })
      );

      // Check if all tasks have been completed
      const completedTasks = taskStatusResponses.filter(
        (response) => response?.result?.status === "completed"
      );

      if (completedTasks.length === tasks.length) {
        // All tasks completed successfully
        const mockups = taskStatusResponses.map(
          (response) => response?.result?.mockups || []
        );

        return NextResponse.json(
          {
            message: "Mockups generated successfully!",
            mockups: mockups.flat(),
            fullResponse: taskStatusResponses,
            taskKeys: tasks,
          },
          { status: 200 }
        );
      } else if (
        taskStatusResponses.some((response) => response?.result?.status === "failed")
      ) {
        return NextResponse.json(
          {
            error: "Mockup generation failed",
            details: taskStatusResponses,
          },
          { status: 500 }
        );
      }
    }

    // If we get here, it's still pending after X attempts
    return NextResponse.json(
      { error: `Timed out after ${maxAttempts} attempts` },
      { status: 504 }
    );
  } catch (error: any) {
    console.error("Error polling mockups:", error);
    return NextResponse.json(
      { error: error.message || "Server error" },
      { status: 500 }
    );
  }
}