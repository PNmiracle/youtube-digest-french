# French Digest

A separate Chrome extension for studying French through captioned YouTube videos. It shows French transcripts, Chinese translations, French study overviews, contextual explanations, notes, and saved vocabulary.

## Contents

- [What it does](#what-it-does)
- [Install alongside YouTube Digest](#install)
- [Set up API keys](#api-keys)
- [Study a video](#study)
- [Data and limits](#data-and-limits)

<a id="what-it-does"></a>
## What it does

- Requests native French captions from Supadata and keeps timestamps for seeking.
- Shows the original French, a Simplified Chinese translation, or an aligned French-Chinese view.
- Creates chapter summaries and useful French quotes when you open Overview.
- Explains a selected French word or sentence in Chinese, including a relevant grammar or usage point.
- Saves timestamped notes and vocabulary. Saved words are highlighted in later transcripts.
- Keeps this version separate from the original YouTube Digest. The extensions have separate Chrome storage and differently named page buttons.

<a id="install"></a>
## Install alongside YouTube Digest

1. Keep this folder at a permanent path, such as `/Users/chengxinzhi/youtube-digest-french`.
2. Open `chrome://extensions` in Chrome and enable **Developer mode**.
3. Choose **Load unpacked**, then select this folder, the one containing `manifest.json`.
4. Confirm that **French Digest** appears as a separate extension. You can keep YouTube Digest installed.
5. After changing these files, click **Reload** on the French Digest card and refresh open YouTube tabs.

The French page button says **Français** and uses blue. This version leaves YouTube's page keyboard shortcuts alone so it does not collide with YouTube Digest's `D` and `N` shortcuts.

<a id="api-keys"></a>
## Set up API keys

Open French Digest **Settings** and enter your own Supadata and DeepSeek API keys. Each extension stores its own settings in Chrome, so keys entered in YouTube Digest are not copied here.

- [Supadata dashboard](https://dash.supadata.ai/) provides the transcript API key.
- [DeepSeek API Keys](https://platform.deepseek.com/api_keys) provides the AI key used for translation, overviews, explanations, and note cleanup.

Enter keys in the extension Settings page, never in source files. Provider use may incur charges under your own accounts.

<a id="study"></a>
## Study a video

1. Open a YouTube video with French subtitles and click **Français** below the player or the extension icon.
2. Read or search the **Transcript**. Switch between **Français**, **中文**, and **法中对照**.
3. Open **Overview** for French chapter summaries and example quotes. The first analysis can take time and use AI tokens.
4. Select a French word or phrase and choose **Explain** for a Chinese explanation; choose **Save word** to add it to Words.
5. Click a timestamp to return to the matching moment in the video.

If Supadata identifies a non-French caption track, this extension stops and asks for a video with French subtitles. If the provider does not report a language, the extension displays the returned track without a language guarantee.

<a id="data-and-limits"></a>
## Data and limits

Transcripts and saved study data are stored in this extension's local Chrome storage. Transcript lookup sends a canonical YouTube watch URL to Supadata. Translation and analysis send relevant text to DeepSeek. There is no developer-operated server or analytics. See [Privacy](PRIVACY.md) and [Security](SECURITY.md).

The extension uses existing captions only; it does not generate speech transcription. API availability, caption quality, and AI explanations can vary. Check important language details against the video and a trusted dictionary.
