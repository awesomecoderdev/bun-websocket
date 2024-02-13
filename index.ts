const server = Bun.serve<{ channel: string }>({
	fetch(req, server) {
		const url = new URL(req.url);
		if (url.pathname) {
			console.log(`upgrade!`);
			// const channel = "ibrahim";

			const channel = url.pathname.replace("/", "");
			const success = server.upgrade(req, {
				data: { channel },
			});
			return success
				? undefined
				: new Response("WebSocket upgrade error", { status: 400 });
		}

		return new Response("Hello world");
	},
	websocket: {
		open(ws) {
			const msg = `${ws.data.channel} has entered the chat`;
			// ws.subscribe("the-group-chat");
			// server.publish("the-group-chat", msg);
			ws.subscribe(ws.data.channel);
			server.publish(ws.data.channel, msg + JSON.stringify(ws));
		},
		message(ws, message) {
			// this is a group chat
			// so the server re-broadcasts incoming message to everyone
			// server.publish("the-group-chat", `${ws.data.channel}: ${message}`);
			server.publish(ws.data.channel, `${ws.data.channel}: ${message}`);
		},
		close(ws) {
			const msg = `${ws.data.channel} has left the chat`;
			// ws.unsubscribe("the-group-chat");
			// server.publish("the-group-chat", msg);
			ws.unsubscribe(ws.data.channel);
			server.publish(ws.data.channel, msg);
		},
	},
});

console.log(`Listening on ${server.hostname}:${server.port}`);
