import React from 'react';
import { Helmet } from 'react-helmet-async';

const SeoHead = ({
    title,
    description,
    image,
    url,
    type = 'website',
    schema
}) => {
    const siteName = 'DeskHub';
    const defaultTitle = 'DeskHub - Cộng Đồng Chia Sẻ Góc Làm Việc Đẹp';
    const defaultDescription = 'Khám phá hàng ngàn ý tưởng setup góc làm việc, bàn gaming, và không gian sáng tạo từ cộng đồng.';
    const defaultImage = 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80';

    const finalTitle = title ? `${title} | ${siteName}` : defaultTitle;
    const finalDescription = description || defaultDescription;
    const finalImage = image || defaultImage;
    const finalUrl = url || window.location.href;

    return (
        <Helmet>
            {/* Basic Meta Tags */}
            <title>{finalTitle}</title>
            <meta name="description" content={finalDescription} />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <link rel="canonical" href={finalUrl} />

            {/* Open Graph (Facebook/Zalo/LinkedIn) */}
            <meta property="og:site_name" content={siteName} />
            <meta property="og:title" content={finalTitle} />
            <meta property="og:description" content={finalDescription} />
            <meta property="og:image" content={finalImage} />
            <meta property="og:url" content={finalUrl} />
            <meta property="og:type" content={type} />

            {/* Twitter Card */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={finalTitle} />
            <meta name="twitter:description" content={finalDescription} />
            <meta name="twitter:image" content={finalImage} />

            {/* Structured Data (JSON-LD) */}
            {schema && (
                <script type="application/ld+json">
                    {JSON.stringify(schema)}
                </script>
            )}
        </Helmet>
    );
};

export default SeoHead;
