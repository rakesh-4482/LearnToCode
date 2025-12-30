import { exec, spawn } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const execPromise = promisify(exec);

// Map of language to file extension and compile/run commands
const LANGUAGE_CONFIGS = {
    'c': {
        extension: 'c',
        compile: (filePath) => `gcc "${filePath}" -o "${filePath}.out"`,
        run: (filePath) => `"${filePath}.out"`,
        cleanup: (filePath) => {
            try { fs.unlinkSync(`${filePath}.out`); } catch (e) {}
        }
    },
    'cpp': {
        extension: 'cpp',
        compile: (filePath) => `g++ "${filePath}" -o "${filePath}.out"`,
        run: (filePath) => `"${filePath}.out"`,
        cleanup: (filePath) => {
            try { fs.unlinkSync(`${filePath}.out`); } catch (e) {}
        }
    },
    'python': {
        extension: 'py',
        run: (filePath) => `python3 "${filePath}"`,
        cleanup: () => {}
    },
    'java': {
        extension: 'java',
        compile: (filePath) => `javac "${filePath}"`,
        run: (filePath) => `java -cp ${path.dirname(filePath)} ${path.basename(filePath, '.java')}`,
        cleanup: (filePath) => {
            try { fs.unlinkSync(filePath.replace('.java', '.class')); } catch (e) {}
        }
    },
    'javascript': {
        extension: 'js',
        run: (filePath) => `node "${filePath}"`,
        cleanup: () => {}
    }
};

export const runCode = async (ws, { code, language, input = '' }) => {
    // Log function that sends logs to WebSocket
    const log = (type, message) => {
        try {
            if (ws.readyState === ws.OPEN) {
                ws.send(JSON.stringify({ type, data: message }));
            }
        } catch (e) {
            console.error('Error writing log to client:', e);
        }
    };

    // Validate input
    if (!code || !language || !LANGUAGE_CONFIGS[language]) {
        const error = `Invalid request: ${!code ? 'Missing code' : !language ? 'Missing language' : `Unsupported language: ${language}`}`;
        log('error', error);
        // ❌ REMOVED: ws.close(1008, error);
        return null;
    }

    const config = LANGUAGE_CONFIGS[language];
    const fileId = uuidv4();
    const filePath = path.join(__dirname, '..', 'temp', `${fileId}.${config.extension}`);
    const dirPath = path.dirname(filePath);

    // Ensure temp directory exists
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }

    // Cleanup function
    const cleanup = async () => {
        try {
            // Language-specific cleanup
            if (config.cleanup) {
                try {
                    await config.cleanup(filePath);
                } catch (cleanupError) {
                    console.error('Error in language-specific cleanup:', cleanupError);
                }
            }
            
            // Remove the source file
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        } catch (error) {
            console.error('Error during cleanup:', error);
        }
    };

    try {
        // Write code to file
        await fs.promises.writeFile(filePath, code);

        // Compile if needed
        if (config.compile) {
            try {
                const { stderr: compileError } = await execPromise(config.compile(filePath));
                if (compileError) {
                    log('error', `Compilation warning: ${compileError}\n`);
                }
            } catch (compileError) {
                log('error', `Compilation failed: ${compileError.stderr || 'Unknown error'}\n`);
                await cleanup();
                // ❌ REMOVED: ws.close(1000, 'Compilation failed');
                return null;
            }
        }

        // Run the code
        const runCommand = config.run(filePath);
        const [command, ...args] = runCommand.split(' ');
        
        const child = spawn(command, args, {
            shell: true,
            stdio: ['pipe', 'pipe', 'pipe']
        });

        // Set a longer timeout for the process (2 minutes)
        const timeout = setTimeout(() => {
            child.kill('SIGKILL');
            log('error', '\nProcess timed out after 2 minutes\n');
            log('end', '');
            // ❌ REMOVED: ws.close(1000, 'Process timed out');
        }, 120000);

        // Handle stdout
        child.stdout.on('data', (data) => {
            log('output', data.toString());
        });

        // Handle stderr
        child.stderr.on('data', (data) => {
            log('error', data.toString());
        });

        // Handle process exit
        child.on('close', async (code) => {
            clearTimeout(timeout);
            await cleanup();
            log('end', '');
            // ✅ FIXED: Keep connection alive - don't close WebSocket
            // ❌ REMOVED: ws.close(1000, 'Process completed');
        });

        // Handle process error
        child.on('error', async (error) => {
            clearTimeout(timeout);
            log('error', `Process error: ${error.message}\n`);
            await cleanup();
            log('end', '');
            // ❌ REMOVED: ws.close(1000, 'Process error');
        });

        // If there's initial input, write it to stdin
        if (input && input.trim()) {
            child.stdin.write(input + '\n');
        }

        // Return the child process for external control (stop functionality)
        return child;

    } catch (error) {
        log('error', `Execution error: ${error.message}\n`);
        await cleanup();
        // ❌ REMOVED: ws.close(1000, 'Execution error');
        return null;
    }
};

// For backward compatibility with SSE