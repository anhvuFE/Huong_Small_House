import type { Category, Product } from '../../types';

export type ChatIntent =
  | 'product_search'
  | 'price_check'
  | 'shipping'
  | 'return'
  | 'hotline'
  | 'greeting'
  | 'fallback';

export interface BotReply {
  text: string;
  products?: Product[];
}

const STOPWORDS = new Set([
  'cho',
  'mình',
  'tôi',
  'em',
  'anh',
  'chị',
  'shop',
  'của',
  'bên',
  'có',
  'không',
  'là',
  'gì',
  'nào',
  'thế',
  'với',
  'và',
  'hay',
  'hoặc',
  'hỗ',
  'trợ',
  'tư',
  'vấn',
  'sản',
  'phẩm',
  'cần',
  'muốn',
  'tìm',
  'mua',
  'bán',
  'giá',
  'bao',
  'nhiêu',
  'thuốc',
  'cho',
  'mẹ',
  'bố',
  'con',
]);

const CATEGORY_HINTS: Array<{ slugFragment: string; keywords: string[] }> = [
  {
    slugFragment: 'immunity',
    keywords: ['miễn dịch', 'đề kháng', 'sức đề kháng', 'cảm cúm', 'tăng cường miễn dịch'],
  },
  {
    slugFragment: 'vitamin',
    keywords: ['vitamin', 'khoáng chất', 'vi chất', 'multivitamin'],
  },
  {
    slugFragment: 'digestive',
    keywords: ['tiêu hóa', 'đường ruột', 'dạ dày', 'táo bón', 'men vi sinh', 'probiotic'],
  },
  {
    slugFragment: 'heart',
    keywords: ['tim mạch', 'huyết áp', 'cholesterol', 'mỡ máu', 'omega', 'tim'],
  },
  {
    slugFragment: 'beauty',
    keywords: ['làm đẹp', 'da', 'collagen', 'tóc', 'móng', 'nám', 'mụn'],
  },
  {
    slugFragment: 'energy',
    keywords: ['mệt', 'năng lượng', 'mệt mỏi', 'kiệt sức', 'tăng lực', 'thể lực'],
  },
  {
    slugFragment: 'sleep',
    keywords: ['mất ngủ', 'khó ngủ', 'ngủ ngon', 'an thần', 'melatonin'],
  },
];

const RETURN_KEYWORDS = ['đổi trả', 'hoàn tiền', 'trả hàng', 'đổi hàng', 'bảo hành'];
const SHIPPING_KEYWORDS = [
  'giao hàng',
  'vận chuyển',
  'ship',
  'đơn hàng',
  'theo dõi đơn',
  'phí ship',
];
const HOTLINE_KEYWORDS = ['hotline', 'số điện thoại', 'liên hệ', 'gọi', 'tổng đài'];
const PRICE_KEYWORDS = ['giá', 'bao nhiêu', 'giá bao'];
const PRODUCT_KEYWORDS = ['sản phẩm', 'thuốc', 'thực phẩm', 'gợi ý', 'tìm', 'mua'];
const GREETING_KEYWORDS = ['chào', 'hello', 'hi', 'xin chào'];

const normalize = (text: string) =>
  text
    .toLowerCase()
    .normalize('NFC')
    .replace(/[!?,.;:()"'`]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const containsAny = (text: string, keywords: string[]) =>
  keywords.some((kw) => text.includes(kw));

export const detectIntent = (raw: string): ChatIntent => {
  const text = normalize(raw);
  if (!text) return 'fallback';
  if (containsAny(text, GREETING_KEYWORDS) && text.length < 25) return 'greeting';
  if (containsAny(text, RETURN_KEYWORDS)) return 'return';
  if (containsAny(text, SHIPPING_KEYWORDS)) return 'shipping';
  if (containsAny(text, HOTLINE_KEYWORDS)) return 'hotline';
  if (containsAny(text, PRICE_KEYWORDS)) return 'price_check';
  if (
    containsAny(text, PRODUCT_KEYWORDS) ||
    CATEGORY_HINTS.some((cat) => containsAny(text, cat.keywords))
  ) {
    return 'product_search';
  }
  return 'fallback';
};

const tokens = (text: string): string[] =>
  normalize(text)
    .split(' ')
    .filter((token) => token.length > 1 && !STOPWORDS.has(token));

const matchCategoryHint = (text: string, categories: Category[]): Category | undefined => {
  const lower = normalize(text);
  for (const hint of CATEGORY_HINTS) {
    if (!containsAny(lower, hint.keywords)) continue;
    const category = categories.find((c) => c.slug.toLowerCase().includes(hint.slugFragment));
    if (category) return category;
  }
  return undefined;
};

export const findProducts = (
  raw: string,
  products: Product[],
  categories: Category[],
  limit = 3,
): Product[] => {
  if (!products.length) return [];
  const lower = normalize(raw);
  const queryTokens = tokens(raw);
  const categoryHit = matchCategoryHint(raw, categories);

  const scored = products.map((product) => {
    const haystack = normalize(`${product.name} ${product.brand} ${product.category}`);
    let score = 0;

    queryTokens.forEach((token) => {
      if (haystack.includes(token)) score += 2;
    });

    if (categoryHit && product.categoryId === categoryHit.categoryId) score += 5;

    if (lower && haystack.includes(lower)) score += 4;

    return { product, score };
  });

  return scored
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((entry) => entry.product);
};

export const buildBotReply = (
  raw: string,
  products: Product[],
  categories: Category[],
): BotReply => {
  const intent = detectIntent(raw);

  switch (intent) {
    case 'greeting':
      return {
        text:
          'Em chào anh/chị! Anh/chị đang tìm sản phẩm cho vấn đề sức khỏe nào ạ? Em có thể gợi ý theo nhu cầu (đề kháng, tiêu hóa, tim mạch, làm đẹp, mất ngủ...).',
      };
    case 'return':
      return {
        text:
          'Bên em hỗ trợ đổi/trả trong vòng 7 ngày kể từ khi nhận hàng nếu sản phẩm còn nguyên seal và đầy đủ tem nhãn. Anh/chị cần đổi sản phẩm nào ạ?',
      };
    case 'shipping':
      return {
        text:
          'Đơn hàng được giao trong 1–3 ngày tại nội thành Hà Nội/HCM, 3–5 ngày các tỉnh khác. Anh/chị cho em xin mã đơn (bắt đầu bằng SH...) để em kiểm tra trạng thái nhé.',
      };
    case 'hotline':
      return {
        text:
          'Hotline tư vấn của Huong Small House: 0336 064 040 (8h–22h hằng ngày). Em cũng có thể hỗ trợ trực tiếp tại đây ạ.',
      };
    case 'price_check':
    case 'product_search': {
      const matches = findProducts(raw, products, categories);
      if (matches.length === 0) {
        return {
          text:
            'Em chưa tìm thấy sản phẩm khớp với mô tả của anh/chị. Anh/chị thử nói rõ hơn vấn đề cần hỗ trợ (vd: "tăng đề kháng", "bổ sung collagen", "vitamin C") để em gợi ý chính xác hơn nhé.',
        };
      }
      return {
        text:
          intent === 'price_check'
            ? 'Dạ, em gửi anh/chị một số sản phẩm phù hợp kèm giá:'
            : 'Em gợi ý anh/chị một vài sản phẩm phù hợp ạ:',
        products: matches,
      };
    }
    case 'fallback':
    default:
      return {
        text:
          'Em đã ghi nhận thông tin của anh/chị. Anh/chị có thể mô tả rõ hơn nhu cầu (vd: "tăng đề kháng cho người lớn", "mất ngủ", "bổ sung canxi") để em gợi ý sản phẩm phù hợp nhé.',
      };
  }
};
