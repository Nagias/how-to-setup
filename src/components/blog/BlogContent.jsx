import React, { useEffect, useRef } from 'react';
import VideoEmbed, { isVideoUrl } from './VideoEmbed';
import './VideoEmbed.css';

/**
 * BlogContent Component
 * Renders blog HTML content with automatic video embedding
 */
const BlogContent = ({ htmlContent, className = '' }) => {
    const contentRef = useRef(null);

    useEffect(() => {
        if (!contentRef.current || !htmlContent) return;

        // Find all video embed placeholders and links
        const container = contentRef.current;

        // Process plain text URLs that might be video links
        const processTextNodes = (node) => {
            if (node.nodeType === Node.TEXT_NODE) {
                const text = node.textContent;
                const urlRegex = /(https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/|instagram\.com\/(?:p|reel|reels|tv)\/|facebook\.com\/.*\/videos\/|facebook\.com\/watch|fb\.watch\/|tiktok\.com\/@[^\/]+\/video\/)[^\s<"']+)/gi;

                const matches = text.match(urlRegex);
                if (matches) {
                    matches.forEach(url => {
                        if (isVideoUrl(url)) {
                            // Create a placeholder div for React to render into
                            const placeholder = document.createElement('div');
                            placeholder.className = 'video-embed-container';
                            placeholder.setAttribute('data-video-url', url);

                            // Replace the URL text with the placeholder
                            const newText = text.replace(url, '');
                            node.textContent = newText;
                            node.parentNode.insertBefore(placeholder, node.nextSibling);
                        }
                    });
                }
            } else if (node.nodeType === Node.ELEMENT_NODE) {
                // Skip if it's already an iframe or video
                if (node.tagName === 'IFRAME' || node.tagName === 'VIDEO') return;

                Array.from(node.childNodes).forEach(processTextNodes);
            }
        };

        // Find <a> tags with video URLs and convert them
        const links = container.querySelectorAll('a');
        links.forEach(link => {
            const href = link.getAttribute('href');
            if (href && isVideoUrl(href)) {
                // Check if this link just contains the URL as text
                if (link.textContent.trim() === href ||
                    link.textContent.trim().includes('youtube.com') ||
                    link.textContent.trim().includes('youtu.be') ||
                    link.textContent.trim().includes('instagram.com') ||
                    link.textContent.trim().includes('facebook.com') ||
                    link.textContent.trim().includes('tiktok.com')) {

                    // Create embed container
                    const embedContainer = document.createElement('div');
                    embedContainer.className = 'video-embed-container';
                    embedContainer.setAttribute('data-video-url', href);

                    // Replace link with embed container
                    link.parentNode.replaceChild(embedContainer, link);
                }
            }
        });

        // Process any remaining text URLs
        processTextNodes(container);

        // Now render React components into placeholders
        const placeholders = container.querySelectorAll('.video-embed-container');
        placeholders.forEach(placeholder => {
            const url = placeholder.getAttribute('data-video-url');
            if (url) {
                // Create the video embed element
                const embedHtml = createEmbedHtml(url);
                placeholder.innerHTML = embedHtml;
            }
        });

    }, [htmlContent]);

    return (
        <div
            ref={contentRef}
            className={`blog-content ${className}`}
            dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
    );
};

// Helper function to create embed HTML (non-React for DOM manipulation)
const createEmbedHtml = (url) => {
    // YouTube
    const youtubeMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/);
    if (youtubeMatch) {
        return `
            <div class="video-embed youtube-embed" style="position:relative;max-width:560px;margin:1.5rem auto;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.15);">
                <div style="position:relative;padding-bottom:56.25%;height:0;">
                    <iframe 
                        src="https://www.youtube.com/embed/${youtubeMatch[1]}?rel=0" 
                        title="YouTube video"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowfullscreen
                        style="position:absolute;top:0;left:0;width:100%;height:100%;border:none;border-radius:12px;"
                    ></iframe>
                </div>
            </div>
        `;
    }

    // Instagram
    const instaMatch = url.match(/instagram\.com\/(p|reel|reels|tv)\/([a-zA-Z0-9_-]+)/);
    if (instaMatch) {
        return `
            <div class="video-embed instagram-embed" style="position:relative;max-width:560px;margin:1.5rem auto;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.15);">
                <iframe 
                    src="https://www.instagram.com/${instaMatch[1]}/${instaMatch[2]}/embed" 
                    title="Instagram post"
                    allowfullscreen
                    scrolling="no"
                    style="width:100%;min-height:500px;border:none;border-radius:12px;"
                ></iframe>
            </div>
        `;
    }

    // Facebook
    const fbMatch = url.match(/facebook\.com\/.*\/videos\/(\d+)|facebook\.com\/watch\/?\?v=(\d+)|fb\.watch\/([a-zA-Z0-9_-]+)/);
    if (fbMatch || url.includes('facebook.com')) {
        const encodedUrl = encodeURIComponent(url);
        return `
            <div class="video-embed facebook-embed" style="position:relative;max-width:560px;margin:1.5rem auto;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.15);">
                <div style="position:relative;padding-bottom:56.25%;height:0;">
                    <iframe 
                        src="https://www.facebook.com/plugins/video.php?href=${encodedUrl}&show_text=false&width=560"
                        title="Facebook video"
                        allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                        allowfullscreen
                        style="position:absolute;top:0;left:0;width:100%;height:100%;border:none;border-radius:12px;"
                    ></iframe>
                </div>
            </div>
        `;
    }

    // TikTok
    const tiktokMatch = url.match(/tiktok\.com\/@[^\/]+\/video\/(\d+)/);
    if (tiktokMatch) {
        return `
            <div class="video-embed tiktok-embed" style="position:relative;max-width:325px;margin:1.5rem auto;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.15);">
                <iframe 
                    src="https://www.tiktok.com/embed/${tiktokMatch[1]}"
                    title="TikTok video"
                    allowfullscreen
                    scrolling="no"
                    style="width:100%;height:575px;border:none;border-radius:12px;"
                ></iframe>
            </div>
        `;
    }

    // Default: just show as link
    return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="video-link">${url}</a>`;
};

export default BlogContent;
