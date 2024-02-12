const server = Bun.serve<{ username: string }>({
	fetch(req, server) {
		const url = new URL(req.url);
		if (url.pathname) {
			console.log(`upgrade!`);
			// const username = "ibrahim";

			// const username = getUsernameFromReq(req);
			const username = url.pathname.replace("/", "");
			const success = server.upgrade(req, {
				data: { username },
			});
			return success
				? undefined
				: new Response("WebSocket upgrade error", { status: 400 });
		}

		return new Response("Hello world");
	},
	websocket: {
		open(ws) {
			const msg = `${ws.data.username} has entered the chat`;
			// ws.subscribe("the-group-chat");
			// server.publish("the-group-chat", msg);
			ws.subscribe(ws.data.username);
			server.publish(ws.data.username, msg + JSON.stringify(ws));
		},
		message(ws, message) {
			// this is a group chat
			// so the server re-broadcasts incoming message to everyone
			// server.publish("the-group-chat", `${ws.data.username}: ${message}`);
			server.publish(ws.data.username, `${ws.data.username}: ${message}`);
		},
		close(ws) {
			const msg = `${ws.data.username} has left the chat`;
			// ws.unsubscribe("the-group-chat");
			// server.publish("the-group-chat", msg);
			ws.unsubscribe(ws.data.username);
			server.publish(ws.data.username, msg);
		},
	},
});

console.log(`Listening on ${server.hostname}:${server.port}`);

function getUsernameFromReq(req: Request) {
	return new URL(req.url).searchParams.get("channelId");
}
