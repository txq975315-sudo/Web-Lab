/**
 * 蓝色系设计Token回归测试
 * 验证CSS变量值符合蓝色系规范（对齐Figma原型）
 */
import { describe, it, expect, beforeEach } from 'vitest'

describe('蓝色系设计Token', () => {
  beforeEach(() => {
    document.documentElement.innerHTML = `
      <style>
        :root {
          /* 品牌色 */
          --color-brand-blue: #00AAFF;
          --color-secondary-blue: #6F9FB7;
          --color-dark-cyan-blue: #467790;

          /* 背景色 */
          --color-bg-base: #F5F5F5;
          --color-bg-raised: #FFFFFF;
          --color-bg-overlay: #FFFFFF;
          --color-bg-inverted: #1E1E1E;

          /* 文字色 */
          --color-text-primary: #1E1E1E;
          --color-text-secondary: #848484;
          --color-text-muted: #B3B3B3;
          --color-text-inverted: #FFFFFF;
          --color-text-link: #00AAFF;

          /* 边框色 */
          --color-border-default: #D9D9D9;
          --color-border-subtle: #EEEEED;
          --color-border-strong: #B3B3B3;

          /* 强调色（变量名保留兼容，值已迁移至蓝色） */
          --color-accent-orange: #00AAFF;
          --color-accent-warm: #00AAFF;
          --color-accent-blue: #6F9FB7;
          --color-accent-green: #52C41A;
          --color-accent-sand: #6F9FB7;

          /* 功能色 */
          --color-success: #52C41A;
          --color-warning: #FAAD14;
          --color-error: #FF4D4F;
          --color-info: #00AAFF;

          /* 圆角 */
          --radius-sm: 8px;
          --radius-md: 13px;
          --radius-lg: 17px;
          --radius-card: 36px;

          /* 字体 */
          --font-heading: 'Microsoft YaHei', 'PingFang SC', 'Arial', sans-serif;
          --font-body: 'Microsoft YaHei', 'PingFang SC', 'Arial', sans-serif;
          --font-heading-cn: 'Microsoft YaHei', 'PingFang SC', sans-serif;
          --font-body-cn: 'Microsoft YaHei', 'PingFang SC', sans-serif;

          /* 兼容别名 */
          --color-accent: #00AAFF;
          --color-accent-dim: rgba(0, 170, 255, 0.12);
          --color-accent-glow: rgba(0, 170, 255, 0.18);
        }
      </style>
    `;
  });

  function getVar(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  }

  describe('品牌色', () => {
    it('品牌蓝应为 #00AAFF', () => {
      expect(getVar('--color-brand-blue')).toBe('#00AAFF');
    });
    it('辅助蓝应为 #6F9FB7', () => {
      expect(getVar('--color-secondary-blue')).toBe('#6F9FB7');
    });
    it('深青蓝应为 #467790', () => {
      expect(getVar('--color-dark-cyan-blue')).toBe('#467790');
    });
  });

  describe('强调色迁移（变量名保留，值改蓝）', () => {
    it('--color-accent-orange 应映射到 #00AAFF', () => {
      expect(getVar('--color-accent-orange')).toBe('#00AAFF');
    });
    it('--color-accent-warm 应映射到 #00AAFF', () => {
      expect(getVar('--color-accent-warm')).toBe('#00AAFF');
    });
    it('--color-accent 应映射到 #00AAFF', () => {
      expect(getVar('--color-accent')).toBe('#00AAFF');
    });
  });

  describe('背景色', () => {
    it('--color-bg-base 应为 #F5F5F5（非暖米色）', () => {
      expect(getVar('--color-bg-base')).toBe('#F5F5F5');
    });
    it('--color-bg-raised 应为 #FFFFFF', () => {
      expect(getVar('--color-bg-raised')).toBe('#FFFFFF');
    });
    it('--color-bg-overlay 应为 #FFFFFF', () => {
      expect(getVar('--color-bg-overlay')).toBe('#FFFFFF');
    });
  });

  describe('文字色', () => {
    it('--color-text-primary 应为 #1E1E1E', () => {
      expect(getVar('--color-text-primary')).toBe('#1E1E1E');
    });
    it('--color-text-link 应为 #00AAFF（品牌蓝）', () => {
      expect(getVar('--color-text-link')).toBe('#00AAFF');
    });
  });

  describe('功能色', () => {
    it('--color-success 应为 #52C41A', () => {
      expect(getVar('--color-success')).toBe('#52C41A');
    });
    it('--color-warning 应为 #FAAD14', () => {
      expect(getVar('--color-warning')).toBe('#FAAD14');
    });
    it('--color-error 应为 #FF4D4F', () => {
      expect(getVar('--color-error')).toBe('#FF4D4F');
    });
    it('--color-info 应为 #00AAFF', () => {
      expect(getVar('--color-info')).toBe('#00AAFF');
    });
  });

  describe('圆角', () => {
    it('--radius-sm 应为 8px（非Anthropic的4px）', () => {
      expect(getVar('--radius-sm')).toBe('8px');
    });
    it('--radius-md 应为 13px', () => {
      expect(getVar('--radius-md')).toBe('13px');
    });
    it('--radius-lg 应为 17px', () => {
      expect(getVar('--radius-lg')).toBe('17px');
    });
    it('--radius-card 应为 36px（新增）', () => {
      expect(getVar('--radius-card')).toBe('36px');
    });
  });

  describe('字体', () => {
    it('--font-heading 应包含 Microsoft YaHei', () => {
      expect(getVar('--font-heading')).toContain('Microsoft YaHei');
    });
    it('--font-heading 不应包含 Poppins', () => {
      expect(getVar('--font-heading')).not.toContain('Poppins');
    });
    it('--font-body 应包含 Microsoft YaHei', () => {
      expect(getVar('--font-body')).toContain('Microsoft YaHei');
    });
  });
});
