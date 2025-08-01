import uWS from 'uWebSockets.js';

interface UserData {
    session: string;
}

const sessions = new Map<string, Set<uWS.WebSocket<UserData>>>();

export function startWebSocketServer() {
    uWS.App().ws<UserData>('/*', {
        idleTimeout: 60,

        open: (ws) => {
            console.log('A WebSocket connected.');
        },

        message: (ws, message, isBinary) => {
            try {
                const stringMessage = new TextDecoder().decode(message);
                const { session, data } = JSON.parse(stringMessage);
                if (!ws.getUserData().session) {
                    if (!sessions.has(session)) {
                        sessions.set(session, new Set());
                    }
                    sessions.get(session)!.add(ws);
                    ws.getUserData().session = session;
                    console.log(`Client joined session: ${session}`);
                }

                const sessionClients = sessions.get(session);
                if (sessionClients) {
                    for (const client of sessionClients) {
                        if (client !== ws) {
                            client.send(JSON.stringify(data), isBinary);
                        }
                    }
                }
            } catch (error) {
                console.error('Failed to process message:', error);
            }
        },

        close: (ws, code, message) => {
            const userData = ws.getUserData();
            const session = userData.session;

            if (session && sessions.has(session)) {
                const sessionClients = sessions.get(session)!;
                sessionClients.delete(ws);
                console.log(`Client left session: ${session}`);

                if (sessionClients.size === 0) {
                    sessions.delete(session);
                    console.log(`Session closed: ${session}`);
                }
            }
        }
    }).listen(9001, (token) => {
        if (token) {
            console.log('WebSocket server listening on port 9001');
        } else {
            console.error('Failed to start WebSocket server');
        }
    });
}