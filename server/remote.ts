import uWS from 'uWebSockets.js';

interface UserData {
    session: string;
    isHost: boolean;
}

interface SessionState {
    windows: any[];
    stackingOrder: string[];
}

interface SessionInfo {
    clients: Set<uWS.WebSocket<UserData>>;
    state: SessionState | null;
    host: uWS.WebSocket<UserData> | null;
}

const sessions = new Map<string, SessionInfo>();

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
                    handleJoinSession(ws, session, data);
                } else {
                    handleSessionMessage(ws, session, data);
                }
            } catch (error) {
                console.error('Failed to process message:', error);
            }
        },

        close: (ws, code, message) => {
            const userData = ws.getUserData();
            const session = userData.session;

            if (session && sessions.has(session)) {
                const sessionInfo = sessions.get(session)!;
                sessionInfo.clients.delete(ws);
                console.log(`Client left session: ${session}`);

                if (sessionInfo.host === ws && sessionInfo.clients.size > 0) {
                    const nextClient = sessionInfo.clients.values().next().value;
                    sessionInfo.host = nextClient || null;
                    if (sessionInfo.host) {
                        sessionInfo.host.getUserData().isHost = true;
                        console.log(`New host assigned for session: ${session}`);

                        sessionInfo.host.send(JSON.stringify({
                            type: 'hostTransfer',
                            message: 'You are now the session host'
                        }), false);
                    }
                }

                if (sessionInfo.clients.size === 0) {
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

function handleJoinSession(ws: uWS.WebSocket<UserData>, session: string, data: any) {
    if (!sessions.has(session)) {
        sessions.set(session, {
            clients: new Set(),
            state: data.state || null,
            host: ws
        });
        ws.getUserData().isHost = true;
        console.log(`New session created: ${session} with host`);
    } else {
        const sessionInfo = sessions.get(session)!;
        ws.getUserData().isHost = false;

        if (sessionInfo.host && isWebSocketOpen(sessionInfo.host)) {
            sessionInfo.host.send(JSON.stringify({
                type: 'requestState',
                requestingClient: 'new_client'
            }), false);
        }
    }

    const sessionInfo = sessions.get(session)!;
    sessionInfo.clients.add(ws);
    ws.getUserData().session = session;

    console.log(`Client joined session: ${session} (${sessionInfo.clients.size} total clients)`);

    if (sessionInfo.state) {
        ws.send(JSON.stringify({
            type: 'sessionState',
            state: sessionInfo.state
        }), false);
    }
}

function handleSessionMessage(ws: uWS.WebSocket<UserData>, session: string, data: any) {
    const sessionInfo = sessions.get(session);
    if (!sessionInfo) return;

    switch (data.type) {
        case 'sessionState':
            if (ws === sessionInfo.host) {
                sessionInfo.state = data.state;
                broadcastToSession(session, data, ws);
            }
            break;

        case 'addWindow':
        case 'closeWindow':
        case 'bringToFront':
        case 'updateWindow':
            broadcastToSession(session, data, ws);

            if (ws === sessionInfo.host) {
                updateSessionState(sessionInfo, data);
            }
            break;

        case 'requestState':
            if (ws === sessionInfo.host && sessionInfo.state) {
                broadcastToSession(session, {
                    type: 'sessionState',
                    state: sessionInfo.state
                });
            }
            break;

        default:
            broadcastToSession(session, data, ws);
            break;
    }
}

function broadcastToSession(session: string, data: any, sender?: uWS.WebSocket<UserData>) {
    const sessionInfo = sessions.get(session);
    if (!sessionInfo) return;

    const message = JSON.stringify(data);

    for (const client of sessionInfo.clients) {
        if (client !== sender && isWebSocketOpen(client)) {
            client.send(message, false);
        }
    }
}

function updateSessionState(sessionInfo: SessionInfo, data: any) {
    if (!sessionInfo.state) {
        sessionInfo.state = { windows: [], stackingOrder: [] };
    }

    switch (data.type) {
        case 'addWindow':
            if (data.window) {
                sessionInfo.state.windows.push(data.window);
                sessionInfo.state.stackingOrder.push(data.window.id);
            }
            break;

        case 'closeWindow':
            if (data.id) {
                sessionInfo.state.windows = sessionInfo.state.windows.filter(w => w.id !== data.id);
                sessionInfo.state.stackingOrder = sessionInfo.state.stackingOrder.filter(id => id !== data.id);
            }
            break;

        case 'bringToFront':
            if (data.id) {
                sessionInfo.state.stackingOrder = sessionInfo.state.stackingOrder.filter(id => id !== data.id);
                sessionInfo.state.stackingOrder.push(data.id);
            }
            break;

        case 'updateWindow':
            if (data.id && data.updates) {
                const windowIndex = sessionInfo.state.windows.findIndex(w => w.id === data.id);
                if (windowIndex !== -1) {
                    sessionInfo.state.windows[windowIndex] = {
                        ...sessionInfo.state.windows[windowIndex],
                        ...data.updates
                    };
                }
            }
            break;
    }
}

function isWebSocketOpen(ws: uWS.WebSocket<UserData>): boolean {
    try {
        ws.getUserData();
        return true;
    } catch {
        return false;
    }
}