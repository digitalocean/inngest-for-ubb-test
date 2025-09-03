
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

// Function 3: hourly cron job with random repeats
const hourlyJob = inngest.createFunction(
    { id: "hourly-job" },
    { cron: "0 * * * *" }, // Runs at minute 0 of every hour
    async ({ step }) => {
        const count = Math.floor(Math.random() * (1000 - 100 + 1)) + 100;
        for (let i = 0; i < count; i++) {
            await step.run(`Send event ${i}`, async () => {
                console.log(`Hourly job event ${i} triggered!`);
            });
        }
        return { message: `Hourly job complete, ran ${count} times` };
    }
);

// List your Inngest functions here
const inngestFunctions = [helloWorld, goodbyeWorld, hourlyJob];

// Handle Inngest Cloud sync (PUT request)
app.put("/api/inngest", express.json(), (req, res) => {
		try {
			console.log("Sync request received");
			console.log("Functions:", inngestFunctions);

			const functionsMeta = inngestFunctions.map(fn => ({
				id: fn.id || fn._id || "unknown",
				name: fn.name || "unknown",
				event: fn.trigger?.event || "unknown"
			}));

			res.status(200).json({ functions: functionsMeta });
		} catch (err) {
			console.error("Error in PUT /api/inngest:", err);
			res.status(500).json({ error: err.message });
		}
});

// Expose a route to receive events and trigger functions
app.post("/api/inngest", express.json(), async (req, res) => {
		console.log(req.body);
		const { name, data, count = 10 } = req.body; // Default to 10 if not provided
		try {
			for (let i = 0; i < count; i++) {
				await inngest.send({ name, data: { ...data, index: i } });
			}
			res.status(200).json({ status: `${count} events sent` });
		} catch (err) {
			res.status(500).json({ error: err.message });
		}
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
	console.log(`Server running on http://localhost:${port}`);
});
