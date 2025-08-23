const fs = require("fs");
const path = require("path");

// Path to your TTF font
const fontPath = path.join(__dirname, "NotoSansEthiopic-Regular.ttf");

// Read the font file
const fontData = fs.readFileSync(fontPath);

// Convert to Base64
const base64Font = fontData.toString("base64");

// Create JS module content
const jsContent = `const NotoSansEthiopic = "${base64Font}";\nexport default NotoSansEthiopic;`;

// Save to file
fs.writeFileSync(path.join(__dirname, "NotoSansEthiopic-Regular-normal.js"), jsContent);

console.log("Font converted successfully!");
