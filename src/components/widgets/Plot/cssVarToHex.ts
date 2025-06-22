import { convert, extractColorParts, addAlphaToHex } from 'colorizr';


export function cssVarToHex(variableName: string): string {
    const temp = document.createElement('div');
    temp.style.display = 'none';
    temp.style.backgroundColor = `var(${variableName})`;
    document.body.appendChild(temp);
    const computedColor = getComputedStyle(temp).backgroundColor;
    document.body.removeChild(temp);

    const parts = extractColorParts(computedColor);
    const alpha = parts.alpha !== undefined ? parts.alpha : 1;
    const hex = addAlphaToHex(convert(computedColor, 'hex'), alpha);
    return hex;
}
