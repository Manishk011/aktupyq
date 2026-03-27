import React from 'react';
import { Helmet } from 'react-helmet-async';

export default function SEO({ title, description, name, type, image, schema, canonicalUrl, prevUrl, nextUrl }) {
  const defaultTitle = "AKTU PYQ | Latest AKTU Quantum, Notes & PYQs";
  const defaultDescription = "Download the latest AKTU Quantum series, previous year question papers (PYQs), handwritten notes, and updated syllabus for all B.Tech branches.";
  const defaultImage = "/logo.jpeg";
  const defaultType = "website";
  const defaultName = "AKTU PYQ";

  const siteTitle = title ? `${title} | AKTU PYQ` : defaultTitle;

  return (
    <Helmet>
      {/* Standard metadata tags */}
      <title>{siteTitle}</title>
      <meta name="description" content={description || defaultDescription} />
      
      {/* Pagination & SEO Links */}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
      {prevUrl && <link rel="prev" href={prevUrl} />}
      {nextUrl && <link rel="next" href={nextUrl} />}

      {/* OpenGraph tags */}
      <meta property="og:type" content={type || defaultType} />
      <meta property="og:title" content={siteTitle} />
      <meta property="og:description" content={description || defaultDescription} />
      <meta property="og:image" content={image || defaultImage} />
      
      {/* Twitter tags */}
      <meta name="twitter:creator" content={name || defaultName} />
      <meta name="twitter:card" content={type === 'article' ? 'summary_large_image' : 'summary'} />
      <meta name="twitter:title" content={siteTitle} />
      <meta name="twitter:description" content={description || defaultDescription} />
      <meta name="twitter:image" content={image || defaultImage} />

      {/* Schema.org tags */}
      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      )}
    </Helmet>
  );
}
