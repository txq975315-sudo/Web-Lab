/**
 * ThinkingLab 设计系统示例组件
 * 基于 DOCX 蓝色系官方规范
 */

import React from 'react';

// 落地页Hero区域示例 - 蓝色系
export const HeroExample = () => {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(180deg, #E3F2FD 0%, #FFFFFF 100%)' }}>
      {/* 顶栏 */}
      <header className="top-navbar">
        <div className="navbar-left">
          <div className="navbar-logo">ThinkingLab</div>
        </div>
        <div className="navbar-right">
          <button className="btn-ghost btn-md">登录</button>
          <button className="btn-ghost btn-md">语言</button>
        </div>
      </header>
      
      {/* 主内容 */}
      <main className="flex-1 flex items-center justify-center px-6">
        <div className="text-center fade-in-up">
          <h1 className="text-4xl md:text-5xl font-bold mb-4"
              style={{ 
                fontFamily: 'var(--font-chinese)',
                color: 'var(--color-gray-900)'
              }}>
            思维训练工作台
          </h1>
          <p className="text-lg md:text-xl mb-8"
             style={{ 
               fontFamily: 'var(--font-chinese)',
               color: 'var(--color-gray-500)',
               lineHeight: '1.6'
             }}>
            你的刻意练习圣地
          </p>
          <button className="btn-primary btn-lg">
            立即开始
          </button>
        </div>
      </main>
    </div>
  );
};

// 功能选择页示例 - 蓝色系
export const DashboardExample = () => {
  const features = [
    { icon: '⚡', title: '压力训练', desc: '在压力环境下训练决策能力' },
    { icon: '💬', title: '成长教练', desc: 'AI教练指导你的思维成长' },
    { icon: '🔄', title: '对话考古', desc: '复盘对话，发现提升空间' }
  ];
  
  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(180deg, #E3F2FD 0%, #FFFFFF 100%)' }}>
      {/* 顶栏 */}
      <header className="top-navbar">
        <div className="navbar-left">
          <div className="navbar-logo">ThinkingLab</div>
        </div>
        <div className="navbar-right">
          <button className="btn-ghost btn-md">登录</button>
        </div>
      </header>
      
      {/* 主内容 */}
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="feature-grid w-full">
          {features.map((feature, index) => (
            <div 
              key={feature.title}
              className="card-feature fade-in-up"
              style={{ animationDelay: `${index * 80}ms` }}
            >
              <div className="feature-icon">{feature.icon}</div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-desc">{feature.desc}</p>
              <button className="btn-primary btn-md mt-4">立即进入</button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

// 分段控制器示例 - 蓝色系
export const SegmentControlExample = ({ active = 'practice', onChange }) => {
  const segments = [
    { key: 'practice', label: '练' },
    { key: 'learn', label: '学' },
    { key: 'view', label: '看' }
  ];
  
  return (
    <div className="segment-control">
      {segments.map(seg => (
        <button
          key={seg.key}
          className={`segment-item ${active === seg.key ? 'active' : ''}`}
          onClick={() => onChange?.(seg.key)}
        >
          {seg.label}
        </button>
      ))}
    </div>
  );
};

// 卡片示例 - 蓝色系
export const CardExample = () => {
  return (
    <div className="p-8 bg-white min-h-64 flex items-center justify-center">
      <div className="card-primary max-w-md w-full">
        <h3 className="text-xl font-semibold mb-2"
            style={{ fontFamily: 'var(--font-chinese)', color: 'var(--color-gray-900)' }}>
          知识卡片
        </h3>
        <p className="text-sm mb-4"
           style={{ fontFamily: 'var(--font-chinese)', color: 'var(--color-gray-500)', lineHeight: '1.6' }}>
          这是一个主内容区卡片，使用36px大圆角，蓝色系配色。
        </p>
        <div className="flex gap-3">
          <button className="btn-primary btn-md">确认</button>
          <button className="btn-secondary btn-md">取消</button>
        </div>
      </div>
    </div>
  );
};

// 输入框示例 - 蓝色系
export const InputExample = () => {
  return (
    <div className="p-8 space-y-6 bg-white">
      <div>
        <label className="block text-sm font-medium mb-2"
               style={{ fontFamily: 'var(--font-chinese)', color: 'var(--color-gray-500)' }}>
          文本输入
        </label>
        <input 
          type="text" 
          className="input-field" 
          placeholder="请输入内容..."
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-2"
               style={{ fontFamily: 'var(--font-chinese)', color: 'var(--color-gray-500)' }}>
          文本域
        </label>
        <textarea 
          className="textarea-field" 
          placeholder="请输入更多内容..."
          rows={4}
        />
      </div>
    </div>
  );
};

// 标签示例 - 蓝色系
export const TagExample = () => {
  return (
    <div className="p-8 bg-white">
      <div className="flex gap-3 flex-wrap">
        <span className="tag tag-blue">品牌蓝</span>
        <span className="tag tag-secondary">辅助蓝</span>
        <span className="tag tag-success">成功</span>
        <span className="tag tag-warning">警告</span>
        <span className="tag tag-error">错误</span>
      </div>
    </div>
  );
};

// 按钮示例 - 蓝色系
export const ButtonExample = () => {
  return (
    <div className="p-8 bg-white space-y-4">
      <div className="flex gap-3">
        <button className="btn-primary btn-sm">主按钮 SM</button>
        <button className="btn-primary btn-md">主按钮 MD</button>
        <button className="btn-primary btn-lg">主按钮 LG</button>
      </div>
      <div className="flex gap-3">
        <button className="btn-secondary btn-sm">次要 SM</button>
        <button className="btn-secondary btn-md">次要 MD</button>
        <button className="btn-secondary btn-lg">次要 LG</button>
      </div>
      <div className="flex gap-3">
        <button className="btn-ghost btn-sm">幽灵 SM</button>
        <button className="btn-ghost btn-md">幽灵 MD</button>
        <button className="btn-text btn-md">文字按钮</button>
      </div>
    </div>
  );
};

// 左侧图标栏示例 - 蓝色系
export const SidebarExample = () => {
  const navItems = [
    { icon: '⚡', active: true },
    { icon: '💬', active: false },
    { icon: '🔖', active: false },
    { icon: '🔄', active: false },
    { icon: '📖', active: false },
    { icon: '⚙️', active: false }
  ];
  
  return (
    <div className="p-8 bg-gray-50">
      <div className="workbench-left h-96 border-r border-gray-200">
        {navItems.map((item, index) => (
          <div 
            key={index} 
            className={`nav-icon ${item.active ? 'active' : ''}`}
          >
            {item.icon}
          </div>
        ))}
      </div>
    </div>
  );
};

// 主示例组件
const DesignSystemExample = () => {
  const [activeTab, setActiveTab] = React.useState('hero');
  const [activeSegment, setActiveSegment] = React.useState('practice');
  
  const tabs = [
    { key: 'hero', label: '落地页' },
    { key: 'dashboard', label: '功能选择' },
    { key: 'components', label: '组件示例' }
  ];
  
  return (
    <div className="min-h-screen">
      {/* 示例切换 */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 glass-sidebar px-4 py-2 rounded-full shadow-lg">
        <div className="flex gap-2">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-1 rounded-full text-sm font-medium transition-all ${
                activeTab === tab.key 
                  ? 'bg-blue-500 text-white' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      
      {/* 内容区域 */}
      {activeTab === 'hero' && <HeroExample />}
      {activeTab === 'dashboard' && <DashboardExample />}
      {activeTab === 'components' && (
        <div className="space-y-8 py-12 bg-gray-50">
          <div className="text-center mb-8 pt-8">
            <h2 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-chinese)', color: 'var(--color-gray-900)' }}>
              组件示例 - 蓝色系
            </h2>
            <p className="text-gray-500 mt-2" style={{ fontFamily: 'var(--font-chinese)' }}>
              基于 DOCX 官方规范的组件展示
            </p>
          </div>
          
          <section className="card-primary mx-8">
            <h3 className="text-lg font-semibold mb-4" style={{ fontFamily: 'var(--font-chinese)', color: 'var(--color-gray-900)' }}>
              分段控制器
            </h3>
            <div className="flex justify-center">
              <SegmentControlExample active={activeSegment} onChange={setActiveSegment} />
            </div>
          </section>
          
          <section className="card-primary mx-8">
            <h3 className="text-lg font-semibold mb-4" style={{ fontFamily: 'var(--font-chinese)', color: 'var(--color-gray-900)' }}>
              按钮组件
            </h3>
            <ButtonExample />
          </section>
          
          <section className="card-primary mx-8">
            <h3 className="text-lg font-semibold mb-4" style={{ fontFamily: 'var(--font-chinese)', color: 'var(--color-gray-900)' }}>
              标签组件
            </h3>
            <TagExample />
          </section>
          
          <section className="card-primary mx-8">
            <h3 className="text-lg font-semibold mb-4" style={{ fontFamily: 'var(--font-chinese)', color: 'var(--color-gray-900)' }}>
              输入框
            </h3>
            <InputExample />
          </section>
          
          <section className="card-primary mx-8">
            <h3 className="text-lg font-semibold mb-4" style={{ fontFamily: 'var(--font-chinese)', color: 'var(--color-gray-900)' }}>
              卡片组件
            </h3>
            <CardExample />
          </section>
          
          <section className="card-primary mx-8">
            <h3 className="text-lg font-semibold mb-4" style={{ fontFamily: 'var(--font-chinese)', color: 'var(--color-gray-900)' }}>
              左侧图标栏
            </h3>
            <SidebarExample />
          </section>
        </div>
      )}
    </div>
  );
};

export default DesignSystemExample;
