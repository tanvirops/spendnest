import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env located in the server folder
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });
console.log(`injected env (${Object.keys(process.env).length}) from .env // tip: ⌘ enable debugging { debug: true }`);

// // In production, silence verbose console methods to avoid leaking secrets or cluttering logs.
// if (process.env.NODE_ENV === 'production') {
// 	// keep console.error and console.warn, but noop others
// 	const noop = () => {};
// 	console.log = noop;
// 	console.info = noop;
// 	console.debug = noop;
// }
