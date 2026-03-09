// 地点和路线数据来源：/Users/ronny/workspace/100-出差/出发和达到参考.xlsx

export const PRESET_PLACES: string[] = [
  "一微科技-创新方",
  "前海科兴科学园",
  "宗泰绿凯智荟园",
  "星展广场",
  "深圳国家工程实验室大楼A栋",
  "意中利科技园(南门)",
  "誉润产业园",
  "广东星辰科技发展有限公司",
  "丽枫酒店(东莞大朗松山湖北站店)",
  "雾芯科技(恒明珠国际金融中心店)",
  "金地伊顿山一期",
];

export const PRESET_REASONS: string[] = [
  "去机场",
  "去深圳",
  "去东莞",
  "去客户公司",
  "去公司",
  "去酒店",
  "回家",
  "回珠海",
  "出差",
];

/** 自驾路线数据库：key = "出发地|到达地"，value = {km, fuel} */
export interface RouteInfo {
  km: number;
  fuel: number;
}

// 路线数据来源：/Users/ronny/workspace/100-出差/出发和达到参考.xlsx
// 格式：[出发地, 到达地, 公里数, 报销油费]（油费 = 公里数 × 1元/km）
const ROUTE_DB_RAW: Array<[string, string, number, number]> = [
  // 一微科技-创新方 → 各目的地
  ["一微科技-创新方", "前海科兴科学园", 120, 120],
  ["一微科技-创新方", "宗泰绿凯智荟园", 125, 125],
  ["一微科技-创新方", "星展广场", 130, 130],
  ["一微科技-创新方", "深圳国家工程实验室大楼A栋", 135, 135],
  ["一微科技-创新方", "意中利科技园(南门)", 130, 130],
  ["一微科技-创新方", "誉润产业园", 160, 160],
  ["一微科技-创新方", "广东星辰科技发展有限公司", 170, 170],
  ["一微科技-创新方", "丽枫酒店(东莞大朗松山湖北站店)", 160, 160],
  ["一微科技-创新方", "雾芯科技(恒明珠国际金融中心店)", 130, 130],
  // 各目的地 → 金地伊顿山一期（返程）
  ["前海科兴科学园", "金地伊顿山一期", 100, 100],
  ["宗泰绿凯智荟园", "金地伊顿山一期", 100, 100],
  ["星展广场", "金地伊顿山一期", 100, 100],
  ["深圳国家工程实验室大楼A栋", "金地伊顿山一期", 100, 100],
  ["意中利科技园(南门)", "金地伊顿山一期", 100, 100],
  ["誉润产业园", "金地伊顿山一期", 130, 130],
  ["广东星辰科技发展有限公司", "金地伊顿山一期", 135, 135],
  ["丽枫酒店(东莞大朗松山湖北站店)", "金地伊顿山一期", 130, 130],
  ["雾芯科技(恒明珠国际金融中心店)", "金地伊顿山一期", 100, 100],
];

/** 路线查询：自动匹配出发地和到达地，返回 km 和 fuel */
export function lookupRoute(depart: string, arrive: string): RouteInfo | null {
  const d = depart.trim();
  const a = arrive.trim();
  if (!d || !a) return null;

  // 精确匹配
  const exact = ROUTE_DB_RAW.find(([rd, ra]) => rd === d && ra === a);
  if (exact) return { km: exact[2], fuel: exact[3] };

  // 加载用户自定义路线（localStorage）
  if (typeof window !== "undefined") {
    try {
      const custom = JSON.parse(
        localStorage.getItem("ccbx_route_db") || "{}"
      ) as Record<string, RouteInfo>;
      const key = `${d}|${a}`;
      if (custom[key]) return custom[key];
    } catch {}
  }

  return null;
}

/** 保存用户自定义路线到 localStorage */
export function saveRoute(depart: string, arrive: string, km: number, fuel: number) {
  if (typeof window === "undefined" || !depart.trim() || !arrive.trim()) return;
  if (km <= 0 && fuel <= 0) return;
  try {
    const existing = JSON.parse(
      localStorage.getItem("ccbx_route_db") || "{}"
    ) as Record<string, RouteInfo>;
    existing[`${depart.trim()}|${arrive.trim()}`] = { km, fuel };
    localStorage.setItem("ccbx_route_db", JSON.stringify(existing));
  } catch {}
}
