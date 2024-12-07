const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Ensure assets directory exists
const assetsDir = path.join(__dirname, '../assets');
if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir);
}

// Create a simple icon with text "SA" (for SwoleApp)
async function generateIcon(size, outputPath) {
    const svg = `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#4285F4"/>
        <text x="50%" y="50%" font-family="Arial" font-size="${size/2}"
            fill="white" text-anchor="middle" dominant-baseline="middle">
            SA
        </text>
    </svg>`;

    await sharp(Buffer.from(svg))
        .resize(size, size)
        .toFile(outputPath);
}

async function generateAllIcons() {
    // Generate icon.png (1024x1024)
    await generateIcon(1024, path.join(assetsDir, 'icon.png'));
    
    // Generate adaptive-icon.png (1024x1024)
    await generateIcon(1024, path.join(assetsDir, 'adaptive-icon.png'));
    
    // Generate favicon.png (48x48)
    await generateIcon(48, path.join(assetsDir, 'favicon.png'));
    
    // Generate splash.png (2048x2048)
    await generateIcon(2048, path.join(assetsDir, 'splash.png'));
}

generateAllIcons()
    .then(() => console.log('Icons generated successfully!'))
    .catch(console.error); 