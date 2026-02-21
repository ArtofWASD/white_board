export function generateSlug(text: string): string {
  const cyrillicToLatinMap: { [key: string]: string } = {
    а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'yo', ж: 'zh',
    з: 'z', и: 'i', й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o',
    п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f', х: 'h', ц: 'ts',
    ч: 'ch', ш: 'sh', щ: 'shch', ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu',
    я: 'ya',
  };

  const str = text.toLowerCase().trim();
  let slug = '';

  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    if (cyrillicToLatinMap[char] !== undefined) {
      slug += cyrillicToLatinMap[char];
    } else if (/[a-z0-9]/.test(char)) {
      slug += char;
    } else if (/\s/.test(char) || char === '-' || char === '_') {
      if (slug.length > 0 && slug[slug.length - 1] !== '-') {
        slug += '-';
      }
    }
  }

  // Remove trailing dash if any
  if (slug.endsWith('-')) {
    slug = slug.slice(0, -1);
  }

  return slug;
}
