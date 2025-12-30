import { spawn } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import os from 'os';

// Supported languages and their configurations
const LANGUAGE_CONFIG = {
    javascript: {
        extension: 'js',
        command: 'node',
        args: (filename) => [filename],
        timeout: 3000, // 3 seconds
        memoryLimit: 128 // MB
    },
    python: {
        extension: 'py',
        command: 'python3',
        args: (filename) => [filename],
        timeout: 3000,
        memoryLimit: 128
    },
    java: {
        extension: 'java',
        command: 'java',
        args: [],
        timeout: 3000,
        memoryLimit: 256,
        compile: {
            command: 'javac',
            args: (filename) => [filename]
        }
    },
    cpp: {
        extension: 'cpp',
        command: './a.out',
        args: [],
        timeout: 3000,
        memoryLimit: 256,
        compile: {
            command: 'g++',
            args: (filename) => [filename, '-o', 'a.out']
        }
    },
    c: {
        extension: 'c',
        command: './a.out',
        args: [],
        timeout: 3000,
        memoryLimit: 256,
        compile: {
            command: 'gcc',
            args: (filename) => [filename, '-o', 'a.out']
        }
    }
};

// Create a temporary directory for code execution
async function createTempDir() {
    const tempDir = path.join(os.tmpdir(), 'code-exec-' + uuidv4());
    await fs.mkdir(tempDir, { recursive: true });
    return tempDir;
}

// Clean up temporary files
async function cleanup(tempDir) {
    try {
        await fs.rm(tempDir, { recursive: true, force: true });
    } catch (error) {
        console.error('Error cleaning up temp files:', error);
    }
}

// Execute code with timeout
function executeWithTimeout(command, args, input, timeout, cwd) {
    return new Promise((resolve, reject) => {
        const process = spawn(command, args, {
            cwd,  // Set the working directory
            stdio: ['pipe', 'pipe', 'pipe'],
            shell: false
        });

        let output = '';
        let error = '';
        let timedOut = false;

        const timer = setTimeout(() => {
            timedOut = true;
            process.kill();
            reject(new Error('Execution timed out'));
        }, timeout);

        process.stdout.on('data', (data) => {
            output += data.toString();
        });

        process.stderr.on('data', (data) => {
            error += data.toString();
        });

        process.on('close', (code) => {
            clearTimeout(timer);
            if (timedOut) return;

            if (code !== 0) {
                reject(new Error(error || `Process exited with code ${code}`));
                return;
            }
            
            resolve(output.trim());
        });

        // Handle input if provided
        if (input) {
            process.stdin.write(input);
            process.stdin.end();
        }
    });
}

// Main function to execute code
export async function executeCode({ code, language, input, expectedOutput, timeLimit, memoryLimit }) {
    const config = LANGUAGE_CONFIG[language];
    if (!config) {
        throw new Error(`Unsupported language: ${language}`);
    }

    const tempDir = await createTempDir();
    const filename = `code.${config.extension}`;
    const filePath = path.join(tempDir, filename);

    try {
        // Write code to file
        await fs.writeFile(filePath, code);
        console.log(`Code written to ${filePath}`);

        // For compiled languages, handle compilation
        if (config.compile) {
            try {
                console.log(`Compiling ${filename}...`);
                await executeWithTimeout(
                    config.compile.command,
                    config.compile.args(filename),
                    null,
                    config.timeout,
                    tempDir  // Set working directory
                );
                console.log('Compilation successful');
            } catch (error) {
                console.error('Compilation failed:', error);
                return {
                    output: '',
                    error: `Compilation error: ${error.message}`,
                    isPassed: false,
                    executionTime: 0,
                    memoryUsed: 0
                };
            }
        }

        // Execute the code
        console.log(`Executing ${filename}...`);
        const startTime = process.hrtime();
        const output = await executeWithTimeout(
            config.command,
            typeof config.args === 'function' ? config.args(filename) : config.args,
            input,
            timeLimit || config.timeout,
            tempDir  // Set working directory
        );
        const endTime = process.hrtime(startTime);
        const executionTime = endTime[0] * 1000 + endTime[1] / 1e6; // Convert to ms

        // Compare output with expected output (case insensitive and trim whitespace)
        const isPassed = output.toLowerCase().trim() === String(expectedOutput || '').toLowerCase().trim();

        console.log('Execution successful. Output:', output);
        
        return {
            output,
            error: '',
            isPassed,
            executionTime,
            memoryUsed: 0, // TODO: Implement memory measurement
            expectedOutput
        };

    } catch (error) {
        console.error('Execution failed:', error);
        return {
            output: '',
            error: error.message,
            isPassed: false,
            executionTime: 0,
            memoryUsed: 0
        };
    } finally {
        // Clean up temporary files
        await cleanup(tempDir);
    }
}

// For testing directly
if (process.argv[1] === import.meta.filename) {
    // Test Python code
    const testCode = process.argv[2] || 'print("Hello, Python!")';
    const testLang = process.argv[3] || 'python';
    
    console.log('Testing code execution...');
    console.log('Language:', testLang);
    console.log('Code:', testCode);
    
    executeCode({
        code: testCode,
        language: testLang,
        input: '',
        expectedOutput: 'Hello, Python!',
        timeLimit: 3000
    })
    .then(result => {
        console.log('Execution result:', JSON.stringify(result, null, 2));
        process.exit(0);
    })
    .catch(error => {
        console.error('Error:', error);
        process.exit(1);
    });
}
