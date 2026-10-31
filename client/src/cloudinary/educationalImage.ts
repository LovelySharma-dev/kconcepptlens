import type { CloudinaryImage } from '@cloudinary/url-gen';
import { limitFit } from '@cloudinary/url-gen/actions/resize';
import { format, quality } from '@cloudinary/url-gen/actions/delivery';
import { auto } from '@cloudinary/url-gen/qualifiers/format';
import { auto as autoQuality, autoLow } from '@cloudinary/url-gen/qualifiers/quality';
import { lessonImageWidth } from '@conceptlens/shared';
import { cld } from './config';

/**
 * Diagram delivery uses c_limit so labels are not cropped.
 * c_fill would cut scientific annotations. Format and quality are separate
 * delivery steps, matching the Cloudinary React skill.
 */
export function buildEducationalImage(remoteUrl: string, lowData: boolean): CloudinaryImage {
  const image = cld.image(remoteUrl);
  image.setDeliveryType('fetch');
  image.resize(limitFit().width(lessonImageWidth(lowData)));
  image.delivery(format(auto()));
  image.delivery(quality(lowData ? autoLow() : autoQuality()));
  return image;
}

export function educationalDeliveryUrl(remoteUrl: string, lowData: boolean): string {
  return buildEducationalImage(remoteUrl, lowData).toURL();
}
