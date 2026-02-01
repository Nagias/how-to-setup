import React from 'react';

/**
 * VideoEmbed Component
 * Detects and embeds videos from YouTube, Instagram, Facebook, TikTok
 */

// Extract video ID from various platforms
const getVideoInfo = (url) => {
    if (!url) return null;

    // YouTube
    const youtubePatterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
        /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/
    ];

    for (const pattern of youtubePatterns) {
        const match = url.match(pattern);
        if (match) {
            return { platform: 'youtube', id: match[1] };
        }
    }

    // Instagram Reel/Post
    const instagramPattern = /instagram\.com\/(p|reel|reels|tv)\/([a-zA-Z0-9_-]+)/;
    const instaMatch = url.match(instagramPattern);
    if (instaMatch) {
        return { platform: 'instagram', id: instaMatch[2], type: instaMatch[1] };
    }

    // Facebook Video
    const facebookPatterns = [
        /facebook\.com\/.*\/videos\/(\d+)/,
        /facebook\.com\/watch\/?\?v=(\d+)/,
        /fb\.watch\/([a-zA-Z0-9_-]+)/
    ];

    for (const pattern of facebookPatterns) {
        const match = url.match(pattern);
        if (match) {
            return { platform: 'facebook', id: match[1], url: url };
        }
    }

    // TikTok
    const tiktokPattern = /tiktok\.com\/@[^\/]+\/video\/(\d+)/;
    const tiktokMatch = url.match(tiktokPattern);
    if (tiktokMatch) {
        return { platform: 'tiktok', id: tiktokMatch[1], url: url };
    }

    return null;
};

// Generate embed iframe for each platform
const VideoEmbed = ({ url, className = '' }) => {
    const videoInfo = getVideoInfo(url);

    if (!videoInfo) {
        return (
            <a href={url} target="_blank" rel="noopener noreferrer" className={`video-link ${className}`}>
                {url}
            </a>
        );
    }

    const wrapperStyle = {
        position: 'relative',
        width: '100%',
        maxWidth: '560px',
        margin: '1.5rem auto',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
    };

    const iframeStyle = {
        border: 'none',
        borderRadius: '12px'
    };

    switch (videoInfo.platform) {
        case 'youtube':
            return (
                <div style={wrapperStyle} className={`video-embed youtube-embed ${className}`}>
                    <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
                        <iframe
                            src={`https://www.youtube.com/embed/${videoInfo.id}?rel=0`}
                            title="YouTube video"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            style={{
                                ...iframeStyle,
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%'
                            }}
                        />
                    </div>
                </div>
            );

        case 'instagram':
            return (
                <div style={wrapperStyle} className={`video-embed instagram-embed ${className}`}>
                    <iframe
                        src={`https://www.instagram.com/${videoInfo.type}/${videoInfo.id}/embed`}
                        title="Instagram post"
                        allowFullScreen
                        scrolling="no"
                        style={{
                            ...iframeStyle,
                            width: '100%',
                            minHeight: '500px'
                        }}
                    />
                </div>
            );

        case 'facebook':
            const encodedUrl = encodeURIComponent(videoInfo.url);
            return (
                <div style={wrapperStyle} className={`video-embed facebook-embed ${className}`}>
                    <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
                        <iframe
                            src={`https://www.facebook.com/plugins/video.php?href=${encodedUrl}&show_text=false&width=560`}
                            title="Facebook video"
                            allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                            allowFullScreen
                            style={{
                                ...iframeStyle,
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%'
                            }}
                        />
                    </div>
                </div>
            );

        case 'tiktok':
            return (
                <div style={{ ...wrapperStyle, maxWidth: '325px' }} className={`video-embed tiktok-embed ${className}`}>
                    <iframe
                        src={`https://www.tiktok.com/embed/${videoInfo.id}`}
                        title="TikTok video"
                        allowFullScreen
                        scrolling="no"
                        style={{
                            ...iframeStyle,
                            width: '100%',
                            height: '575px'
                        }}
                    />
                </div>
            );

        default:
            return (
                <a href={url} target="_blank" rel="noopener noreferrer" className={`video-link ${className}`}>
                    {url}
                </a>
            );
    }
};

// Utility function to check if a URL is a video
export const isVideoUrl = (url) => {
    return getVideoInfo(url) !== null;
};

// Process HTML content and replace video links with embeds
export const processVideoLinks = (htmlContent) => {
    if (!htmlContent) return htmlContent;

    // Regex to find video URLs in text (not already in iframes)
    const urlRegex = /(https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/|instagram\.com\/(?:p|reel|reels|tv)\/|facebook\.com\/.*\/videos\/|facebook\.com\/watch|fb\.watch\/|tiktok\.com\/@[^\/]+\/video\/)[^\s<"']+)/gi;

    // Replace URLs with placeholder markers
    let processedHtml = htmlContent.replace(urlRegex, (match) => {
        return `<div class="video-embed-placeholder" data-video-url="${match}"></div>`;
    });

    return processedHtml;
};

export default VideoEmbed;
