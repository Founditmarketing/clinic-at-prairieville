import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Analytics script to inject before closing </head> tag
const analyticsScript = `
	<!-- Vercel Web Analytics -->
	<script type="module">
		import { inject } from '/_vercel/insights/script.js';
		inject();
	</script>
	<!-- End Vercel Web Analytics -->
`;

// Function to recursively find all HTML files
function findHtmlFiles(dir, fileList = []) {
	const files = readdirSync(dir);
	
	files.forEach(file => {
		const filePath = join(dir, file);
		const stat = statSync(filePath);
		
		if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
			findHtmlFiles(filePath, fileList);
		} else if (file.endsWith('.html')) {
			fileList.push(filePath);
		}
	});
	
	return fileList;
}

// Function to inject analytics into HTML file
function injectAnalytics(filePath) {
	let content = readFileSync(filePath, 'utf8');
	
	// Check if analytics is already injected
	if (content.includes('/_vercel/insights/script.js')) {
		console.log(`✓ Analytics already present in: ${filePath}`);
		return false;
	}
	
	// Inject before closing </head> tag
	if (content.includes('</head>')) {
		content = content.replace('</head>', `${analyticsScript}</head>`);
		writeFileSync(filePath, content, 'utf8');
		console.log(`✓ Analytics injected into: ${filePath}`);
		return true;
	} else {
		console.warn(`⚠ No </head> tag found in: ${filePath}`);
		return false;
	}
}

// Main execution
console.log('Starting Vercel Analytics injection...\n');

const htmlFiles = findHtmlFiles(__dirname);
let injectedCount = 0;

htmlFiles.forEach(file => {
	if (injectAnalytics(file)) {
		injectedCount++;
	}
});

console.log(`\nComplete! Injected analytics into ${injectedCount} file(s).`);
