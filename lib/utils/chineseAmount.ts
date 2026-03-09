/**
 * 将数字金额转换为中文大写
 * 例：1234.56 → 壹仟贰佰叁拾肆元伍角陆分
 */
export function toChineseAmount(num: number): string {
  if (isNaN(num) || num === 0) return "零元整";

  const digits = ["零", "壹", "贰", "叁", "肆", "伍", "陆", "柒", "捌", "玖"];
  const units = ["", "拾", "佰", "仟"];
  const bigUnits = ["", "万", "亿"];

  const isNegative = num < 0;
  num = Math.abs(Math.round(num * 100)) / 100;

  const [intPart, decPart] = num.toFixed(2).split(".");
  const jiao = parseInt(decPart[0]);
  const fen = parseInt(decPart[1]);

  function convertSection(n: number): string {
    if (n === 0) return "";
    const str = n.toString().padStart(4, "0");
    let result = "";
    let hasZero = false;
    for (let i = 0; i < 4; i++) {
      const d = parseInt(str[i]);
      if (d === 0) {
        hasZero = true;
      } else {
        if (hasZero && result !== "") result += "零";
        result += digits[d] + units[3 - i];
        hasZero = false;
      }
    }
    return result;
  }

  const intNum = parseInt(intPart);
  let result = isNegative ? "负" : "";

  if (intNum === 0) {
    result += "零元";
  } else {
    const sections: number[] = [];
    let tmp = intNum;
    while (tmp > 0) {
      sections.unshift(tmp % 10000);
      tmp = Math.floor(tmp / 10000);
    }

    for (let i = 0; i < sections.length; i++) {
      const sec = sections[i];
      const converted = convertSection(sec);
      if (converted) {
        // 万/亿之后如果下一节首位为零需加"零"
        if (i > 0 && sec < 1000 && result.slice(-1) !== "零") {
          result += "零";
        }
        result += converted + bigUnits[sections.length - 1 - i];
      } else if (i < sections.length - 1) {
        if (result.slice(-1) !== "零") result += "零";
      }
    }
    result += "元";
  }

  if (jiao === 0 && fen === 0) {
    result += "整";
  } else if (jiao === 0) {
    result += "零" + digits[fen] + "分";
  } else if (fen === 0) {
    result += digits[jiao] + "角整";
  } else {
    result += digits[jiao] + "角" + digits[fen] + "分";
  }

  return result;
}
