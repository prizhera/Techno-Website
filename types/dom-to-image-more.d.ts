declare module "dom-to-image-more" {
  interface DomToImageOptions {
    style?: Record<string, string>;
    quality?: number;
    filter?: (node: unknown) => boolean;
  }

  const domtoimage: {
    toPng(node: unknown, options?: DomToImageOptions): Promise<string>;
    toJpeg(node: unknown, options?: DomToImageOptions): Promise<string>;
    toBlob(node: unknown, options?: DomToImageOptions): Promise<Blob>;
    toPixelData(node: unknown, options?: DomToImageOptions): Promise<number[]>;
    toSvg(node: unknown, options?: DomToImageOptions): Promise<string>;
  };
  export default domtoimage;
}

