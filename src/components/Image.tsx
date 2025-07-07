"use client";

import { IKImage } from "imagekitio-next";
//import {  Image as IKImage } from '@imagekit/next';

interface ImageProps {
  path?: string;
  src?: string;
  w?: number;
  h?: number;
  alt: string;
  className?: string;
  tr?: boolean;
}

const urlEndpoint = process.env.NEXT_PUBLIC_URL_ENDPOINT;
if (!urlEndpoint) {
  throw new Error("NEXT_PUBLIC_URL_ENDPOINT is not defined");
}

const Image = ({ path, src, w, h, alt, className, tr }: ImageProps) => {
  const transformation =
    tr && w && h ? [{ width: w.toString(), height: h.toString() }] : undefined;

  return (
    <IKImage
      urlEndpoint={urlEndpoint}
      path={path}
      src={src}
      transformation={transformation}
      width={!tr && w ? w : undefined}
      height={!tr && h ? h : undefined}
      lqip={{ active: true, quality: 20 }}
      alt={alt}
      className={className}
      priority
    />
  );
};

export default Image;
