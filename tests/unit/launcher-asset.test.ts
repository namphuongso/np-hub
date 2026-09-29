import { describe, expect, it } from 'vitest';
import {
    formatCssUrl,
    resolveLauncherAsset,
} from '../../src/component/launcher-asset';

describe('resolveLauncherAsset', () => {
    const DEFAULT_LOGO = '/assets/default-logo.png';

    it('prioritizes image over slotted icon and default logo', () => {
        const result = resolveLauncherAsset(
            'https://example.com/avatar.png',
            undefined,
            DEFAULT_LOGO,
            true, // hasSlottedIcon
        );

        expect(result).toEqual({
            source: 'image',
            isMarkup: false,
            value: 'https://example.com/avatar.png',
            size: 'cover',
        });
    });

    it('prioritizes slotted icon when image is not provided', () => {
        const result = resolveLauncherAsset(
            undefined,
            undefined,
            DEFAULT_LOGO,
            true, // hasSlottedIcon
        );

        expect(result).toEqual({
            source: 'icon',
            isMarkup: false,
            value: '',
            size: '75%',
        });
    });

    it('prioritizes image over icon and default logo', () => {
        const result = resolveLauncherAsset(
            'https://example.com/avatar.png',
            'https://example.com/icon.svg',
            DEFAULT_LOGO,
        );

        expect(result).toEqual({
            source: 'image',
            isMarkup: false,
            value: 'https://example.com/avatar.png',
            size: 'cover',
        });
    });

    it('uses icon when image is not provided', () => {
        const result = resolveLauncherAsset(
            undefined,
            'https://example.com/icon.svg',
            DEFAULT_LOGO,
        );

        expect(result).toEqual({
            source: 'icon',
            isMarkup: false,
            value: 'https://example.com/icon.svg',
            size: '75%',
        });
    });

    it('uses icon when image is empty string or whitespace', () => {
        const result = resolveLauncherAsset(
            '   ',
            'https://example.com/icon.svg',
            DEFAULT_LOGO,
        );

        expect(result).toEqual({
            source: 'icon',
            isMarkup: false,
            value: 'https://example.com/icon.svg',
            size: '75%',
        });
    });

    it('falls back to default logo when neither image nor icon is provided', () => {
        const result = resolveLauncherAsset(undefined, undefined, DEFAULT_LOGO);

        expect(result).toEqual({
            source: 'default',
            isMarkup: false,
            value: DEFAULT_LOGO,
            size: '75%',
        });
    });

    it('falls back to default logo when both image and icon are whitespace', () => {
        const result = resolveLauncherAsset('  ', '', DEFAULT_LOGO);

        expect(result).toEqual({
            source: 'default',
            isMarkup: false,
            value: DEFAULT_LOGO,
            size: '75%',
        });
    });

    it('detects inline SVG/HTML markup for icon', () => {
        const svg = '<svg viewBox="0 0 24 24"><path d="M0 0h24v24H0z"/></svg>';
        const result = resolveLauncherAsset(undefined, svg, DEFAULT_LOGO);

        expect(result).toEqual({
            source: 'icon',
            isMarkup: true,
            value: svg,
            size: '75%',
        });
    });

    it('detects inline SVG/HTML markup for image', () => {
        const svg = '<svg><circle r="10"/></svg>';
        const result = resolveLauncherAsset(svg, undefined, DEFAULT_LOGO);

        expect(result).toEqual({
            source: 'image',
            isMarkup: true,
            value: svg,
            size: 'cover',
        });
    });
});

describe('formatCssUrl', () => {
    it('wraps a raw url in url("...")', () => {
        expect(formatCssUrl('https://example.com/logo.png')).toBe(
            'url("https://example.com/logo.png")',
        );
    });

    it('does not re-wrap if already formatted as url(...)', () => {
        expect(formatCssUrl('url("https://example.com/logo.png")')).toBe(
            'url("https://example.com/logo.png")',
        );
    });

    it('handles data URLs and escapes quotes if necessary', () => {
        expect(formatCssUrl('data:image/svg+xml;utf8,<svg></svg>')).toBe(
            'url("data:image/svg+xml;utf8,<svg></svg>")',
        );
    });
});
