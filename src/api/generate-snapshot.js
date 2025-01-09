import { convert } from "svg-to-png";

export default async function handler(req, res) {
  const { fid } = req.query;

  // نمونه SVG برای فریم
  const svgContent = `
    <svg xmlns="http://www.w3.org/2000/svg" width="800" height="400">
      <rect width="800" height="400" fill="#4CAF50" />
      <text x="50%" y="50%" font-size="24" fill="white" text-anchor="middle" alignment-baseline="middle">
        Farcaster Data Viewer - FID: ${fid}
      </text>
    </svg>
  `;

  try {
    // تبدیل SVG به PNG
    const pngBuffer = await convert(svgContent, { format: "png" });

    // بازگرداندن تصویر PNG
    res.setHeader("Content-Type", "image/png");
    res.send(pngBuffer);
  } catch (error) {
    console.error("Error converting SVG to PNG:", error);
    res.status(500).json({ error: "Failed to generate snapshot" });
  }
}
