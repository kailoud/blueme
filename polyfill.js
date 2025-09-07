// File API polyfill for Node.js compatibility
// This file provides basic File API compatibility for Node.js environments

// Basic File API polyfill - minimal implementation
if (typeof global !== 'undefined' && !global.File) {
    global.File = class File {
        constructor(chunks, filename, options = {}) {
            this.name = filename;
            this.size = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
            this.type = options.type || '';
            this.lastModified = options.lastModified || Date.now();
            this._chunks = chunks;
        }
        
        stream() {
            return new ReadableStream({
                start(controller) {
                    for (const chunk of this._chunks) {
                        controller.enqueue(chunk);
                    }
                    controller.close();
                }
            });
        }
        
        arrayBuffer() {
            return Promise.resolve(Buffer.concat(this._chunks).buffer);
        }
        
        text() {
            return Promise.resolve(Buffer.concat(this._chunks).toString());
        }
    };
}

if (typeof global !== 'undefined' && !global.Blob) {
    global.Blob = class Blob {
        constructor(chunks = [], options = {}) {
            this.size = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
            this.type = options.type || '';
            this._chunks = chunks;
        }
        
        stream() {
            return new ReadableStream({
                start(controller) {
                    for (const chunk of this._chunks) {
                        controller.enqueue(chunk);
                    }
                    controller.close();
                }
            });
        }
        
        arrayBuffer() {
            return Promise.resolve(Buffer.concat(this._chunks).buffer);
        }
        
        text() {
            return Promise.resolve(Buffer.concat(this._chunks).toString());
        }
    };
}

console.log('📁 File API polyfill loaded');
