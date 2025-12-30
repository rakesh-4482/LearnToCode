import express from 'express';
import { WebSocketServer } from 'ws';
import { runCode } from '../controllers/compilerController.js';

const router = express.Router();

// WebSocket initialization function
const initWebSocket = (server) => {
    console.log('Initializing WebSocket server...');
    
    const wss = new WebSocketServer({
        server,
        path: '/ws'
    });

    // Handle WebSocket server errors
    wss.on('error', (error) => {
        console.error('WebSocket server error:', error);
    });

    wss.on('connection', (ws, req) => {
        console.log('WebSocket connection established');
        let currentProcess = null; // Track the current running process
        
        // Handle incoming messages
        ws.on('message', async (message) => {
            try {
                console.log('Received message from client:', message.toString());
                const data = JSON.parse(message.toString());
                
                // Handle different message types
                if (data.type === 'run') {
                    const { code, language, input } = data;
                    
                    if (!code || !language) {
                        const errorMsg = 'Missing code or language';
                        console.error(errorMsg);
                        ws.send(JSON.stringify({
                            type: 'error',
                            error: errorMsg
                        }));
                        return;
                    }

                    console.log(`Running ${language} code with input:`, input || 'No input');
                    currentProcess = await runCode(ws, { code, language, input });
                } else if (data.type === 'input') {
                    // Handle interactive input during execution
                    if (currentProcess && data.input) {
                        console.log('Sending input to process:', data.input);
                        if (currentProcess.stdin && currentProcess.stdin.writable) {
                            currentProcess.stdin.write(data.input);
                        }
                    }
                } else if (data.type === 'stop') {
                    // Handle stop execution
                    console.log('Stop execution requested');
                    if (currentProcess) {
                        if (currentProcess.kill) {
                            currentProcess.kill('SIGTERM');
                        }
                        currentProcess = null;
                    }
                    ws.send(JSON.stringify({
                        type: 'output',
                        data: '\n[Execution stopped by user]\n'
                    }));
                    ws.send(JSON.stringify({
                        type: 'end'
                    }));
                } else {
                    // Legacy support for old message format
                    const { code, language, input } = data;
                    
                    if (!code || !language) {
                        const errorMsg = 'Missing code or language';
                        console.error(errorMsg);
                        ws.send(JSON.stringify({
                            type: 'error',
                            error: errorMsg
                        }));
                        return;
                    }

                    console.log(`Running ${language} code with input:`, input || 'No input');
                    currentProcess = await runCode(ws, { code, language, input });
                }
            } catch (error) {
                const errorMsg = `WebSocket message error: ${error.message}`;
                console.error(errorMsg, error);
                if (ws.readyState === ws.OPEN) {
                    ws.send(JSON.stringify({
                        type: 'error',
                        error: errorMsg
                    }));
                }
            }
        });

        // Handle connection close
        ws.on('close', () => {
            console.log('WebSocket connection closed');
            // Clean up any running process
            if (currentProcess) {
                if (currentProcess.kill) {
                    currentProcess.kill('SIGTERM');
                }
                currentProcess = null;
            }
        });

        // Handle WebSocket errors
        ws.on('error', (error) => {
            console.error('WebSocket error:', error);
            // Clean up any running process
            if (currentProcess) {
                if (currentProcess.kill) {
                    currentProcess.kill('SIGTERM');
                }
                currentProcess = null;
            }
        });
    });

    console.log('WebSocket server is ready');
};

// Keep the old route for backward compatibility
router.get('/run', (req, res) => {
    res.status(400).json({ error: 'Use WebSocket connection instead' });
});

export { router as default, initWebSocket };
