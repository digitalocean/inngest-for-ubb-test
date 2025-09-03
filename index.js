const express = require("express");
const { Inngest } = require("inngest");

const app = express();
const inngest = new Inngest({ id: "my-app", name: "My Inngest App" });

// Function 1: uses step.run
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

// Function 2: another event
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

// Expose a route to receive events and trigger functions
app.post("/api/inngest", express.json(), async (req, res) => {
    console.log(req.body); // Add this line
		const { name, data } = req.body;
		try {
			for (let i = 0; i < 10; i++) {
				await inngest.send({ name, data: { ...data, index: i } });
			}
			res.status(200).json({ status: "10 events sent" });
		} catch (err) {
			res.status(500).json({ error: err.message });
		}
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
