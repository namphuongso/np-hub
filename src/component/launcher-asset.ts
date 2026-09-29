export interface LauncherAssetResolution {
    source: 'image' | 'icon' | 'default';
    isMarkup: boolean;
    value: string;
    size: 'cover' | '75%';
}

/**
 * Resolves the launcher asset based on priority:
 * 1. image prop
 * 2. icon prop / slotted icon
 * 3. default icon
 */
export function resolveLauncherAsset(
    image?: string,
    icon?: string,
    defaultLogo: string = '',
    hasSlottedIcon: boolean = false,
): LauncherAssetResolution {
    const activeImage = image?.trim();
    const activeIcon = icon?.trim();

    if (activeImage) {
        return {
            source: 'image',
            isMarkup: activeImage.startsWith('<'),
            value: activeImage,
            size: 'cover',
        };
    }

    if (hasSlottedIcon) {
        return {
            source: 'icon',
            isMarkup: false,
            value: '',
            size: '75%',
        };
    }

    if (activeIcon) {
        return {
            source: 'icon',
            isMarkup: activeIcon.startsWith('<'),
            value: activeIcon,
            size: '75%',
        };
    }

    return {
        source: 'default',
        isMarkup: defaultLogo.trim().startsWith('<'),
        value: defaultLogo,
        size: '75%',
    };
}

export function formatCssUrl(value: string): string {
    const trimmed = value.trim();
    if (trimmed.startsWith('url(')) {
        return trimmed;
    }
    const escaped = trimmed.replace(/"/g, '\\"');
    return `url("${escaped}")`;
}
