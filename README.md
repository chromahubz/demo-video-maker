# Demo Video Maker

> Screenshots → Professional Videos in 60 seconds

Transform your product screenshots into professional demo videos with AI voiceovers, perfect for Product Hunt launches, landing pages, and social media.

## Features

- **📸 Screenshot Upload**: Drag & drop up to 10 screenshots with reordering capability
- **🤖 AI Script Generation**: Automatically generate compelling demo scripts based on your product description
- **🎨 Multiple Templates**: 6 pre-configured video templates optimized for different platforms
  - Product Hunt Launcher (60s, viral-optimized)
  - Landing Page Hero (90s, conversion-focused)
  - Twitter Demo (30s, short & catchy)
  - LinkedIn Professional (120s, B2B-focused)
  - Feature Showcase (60s, feature highlights)
  - Instagram Story (30s, vertical format)
- **🎙️ AI Voiceovers**: 8 professional AI voices with speed control
- **🎵 Music Library**: 10 royalty-free background tracks
- **📱 Multi-Format Export**: Generate videos in 16:9, 9:16, and 1:1 aspect ratios
- **✨ Auto-Captions**: Automatic caption generation for better engagement
- **🌙 Dark Mode**: Eye-friendly dark mode support
- **📊 Example Gallery**: Browse demos created by other users

## Tech Stack

- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Styling**: Tailwind CSS
- **Icons**: Font Awesome 6
- **Drag & Drop**: SortableJS
- **Backend**: n8n Webhooks (for video processing)

## Installation

1. Clone this repository:
```bash
git clone https://github.com/yourusername/demo-video-maker.git
cd demo-video-maker
```

2. Configure your n8n webhook URL in `.env`:
```env
N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/generate-demo
PORT=3005
```

3. Serve the files using any static server:
```bash
# Option 1: Using Python
python3 -m http.server 3005

# Option 2: Using Node.js http-server
npx http-server -p 3005

# Option 3: Using PHP
php -S localhost:3005
```

4. Open your browser and navigate to `http://localhost:3005`

## Usage

### Step 1: Upload Screenshots
1. Click or drag screenshots into the upload area
2. Upload up to 10 screenshots (max 5MB each)
3. Reorder screenshots by dragging them
4. Click "Continue to Script"

### Step 2: Generate Script
1. Fill in your product information:
   - Product name
   - Category
   - Description
   - Key features
2. Select video length (30s, 60s, 90s, or 2min)
3. Click "Generate Script with AI"
4. Review and edit the generated script
5. Click "Continue to Customization"

### Step 3: Customize Video
1. **Choose Template**: Select from 6 optimized templates
2. **Select Voice**: Pick from 8 AI voices and adjust speed
3. **Background Music**: Choose a track or go silent
4. **Export Formats**: Select aspect ratios (16:9, 9:16, 1:1)
5. **Options**: Enable auto-captions and watermark
6. Click "Generate My Demo Video"

### Step 4: Download
1. Wait for video processing (typically 60 seconds)
2. Download videos in selected formats
3. Share directly to social media
4. Create another demo or start over

## n8n Webhook Integration

The application sends video generation requests to an n8n webhook with the following payload structure:

### Request Payload

```json
{
  "screenshots": [
    "data:image/png;base64,iVBORw0KG...",
    "data:image/png;base64,iVBORw0KG..."
  ],
  "script": "Generated script text...",
  "productInfo": {
    "name": "Product Name",
    "description": "Product description...",
    "features": ["Feature 1", "Feature 2"],
    "category": "saas",
    "length": 60
  },
  "voiceSettings": {
    "voice": "female-excited",
    "speed": 1.0
  },
  "template": "product-hunt-launcher",
  "music": "startup-energy",
  "formats": ["16:9", "9:16"],
  "captions": true,
  "watermark": false
}
```

### Expected Response

```json
{
  "success": true,
  "jobId": "unique-job-id",
  "estimatedTime": 60
}
```

### n8n Workflow Setup

Your n8n workflow should:

1. **Receive Webhook**: Accept POST requests with the payload above
2. **Process Screenshots**: Save base64 images to storage
3. **Generate Voice**: Use TTS API (e.g., ElevenLabs, Google TTS) with the script
4. **Create Video**: Combine screenshots, voiceover, and music
   - Recommended tools: FFmpeg, Remotion, or video API services
5. **Add Captions**: Generate and overlay captions if enabled
6. **Export Formats**: Render in requested aspect ratios
7. **Upload & Return**: Upload to storage and return download URLs

### Sample n8n Nodes

```
Webhook →
Set Variables →
HTTP Request (TTS API) →
Function (Process Images) →
HTTP Request (Video API) →
Set Response
```

## Configuration Files

### templates.json
Defines video template configurations with transitions, pacing, and default settings.

### voices.json
Contains AI voice profiles with metadata like gender, accent, and tone.

### music-library.json
Royalty-free music tracks with BPM, mood, and duration information.

### examples.json
Showcase examples of videos created with the tool.

## Project Structure

```
demo-video-maker/
├── index.html              # Main application UI
├── script.js              # Frontend logic
├── templates.json         # Video template configurations
├── voices.json           # AI voice options
├── music-library.json    # Background music library
├── examples.json         # Example gallery data
├── .env                  # Configuration (n8n webhook URL)
├── .gitignore           # Git ignore rules
└── README.md            # This file
```

## Customization

### Adding New Templates

Edit `templates.json` and add a new template object:

```json
{
  "id": "custom-template",
  "name": "Custom Template",
  "description": "Your template description",
  "duration": "60s",
  "aspectRatio": ["16:9"],
  "icon": "rocket",
  "popular": false,
  "transitionStyle": "fade",
  "pace": "medium",
  "captionsDefault": true
}
```

### Adding New Voices

Edit `voices.json` and add a new voice:

```json
{
  "id": "custom-voice",
  "name": "Custom Voice",
  "gender": "female",
  "accent": "british",
  "tone": "professional",
  "description": "Voice description",
  "sample": "Sample text",
  "popular": false
}
```

### Adding Music Tracks

Edit `music-library.json`:

```json
{
  "id": "custom-track",
  "name": "Track Name",
  "description": "Track description",
  "mood": "upbeat",
  "bpm": 120,
  "duration": "2:00",
  "genres": ["electronic"],
  "bestFor": ["product-hunt-launcher"],
  "popular": false,
  "preview": "track-preview.mp3"
}
```

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Performance Notes

- Screenshots are converted to base64 for transmission
- Maximum 10 screenshots (5MB each) to prevent payload size issues
- For production, consider implementing direct file uploads to cloud storage
- Video processing time varies based on length and complexity

## Future Enhancements

- [ ] Real AI script generation integration (OpenAI, Anthropic)
- [ ] Direct social media posting
- [ ] Video preview before generation
- [ ] Custom branding (logo, colors)
- [ ] Batch video generation
- [ ] Analytics dashboard
- [ ] User accounts and project saving
- [ ] Template marketplace

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## License

MIT License - feel free to use this for your AppSumo products!

## Support

For issues, questions, or feature requests, please open a GitHub issue.

---

**Built for AppSumo launchers and Product Hunt makers** 🚀

Made with ❤️ by the community
