// pages/api/inngest.js
import { Inngest } from "inngest";
import { serve } from "inngest/next";

const inngest = new Inngest({ id: "my-app", name: "My Inngest App" });

const helloWorld = inngest.createFunction(
  { id: "hello-world" },
  { event: "app/hello" },
  async ({ event, step }) => {
    await step.run("Log hello", async () => {
      console.log("Hello from Inngest!", event.data);
    });
    return { message: "Hello complete", data: event.data };
  }
);

const goodbyeWorld = inngest.createFunction(
  { id: "goodbye-world" },
  { event: "app/goodbye" },
  async ({ event, step }) => {
    await step.run("Log goodbye", async () => {
      console.log("Goodbye from Inngest!", event.data);
    });
    return { message: "Goodbye complete", data: event.data };
  }
);

const hourlyJob = inngest.createFunction(
  { id: "hourly-job" },
  { cron: "0 * * * *" },
  async ({ step, client }) => {
    const count = parseInt(process.env.EVENT_COUNT, 10) || 1000;
    await step.run("Send many events", async () => {
      for (let i = 0; i < count; i++) {
        await client.send("app/hello", { data: { index: i } });
      }
    });
    return { message: `Hourly job complete, sent ${count} events` };
  }
);

export default serve({
  client: inngest,
  functions: [helloWorld, goodbyeWorld, hourlyJob],
});