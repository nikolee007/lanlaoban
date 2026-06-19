import type { Metadata } from 'next'

/**
 * Global supply chain pages metadata generators.
 * Each function returns a Metadata object for the corresponding route.
 * Use these in page/layout generateMetadata exports.
 */

export function globalSupplyMetadata(): Metadata {
  return {
    title: '全球供应链 - 懒老板',
    description: '找工厂、找商品、找渠道 — 懒老板连接中国优质工厂与全球渠道，一站式对接全球资源',
  }
}

export function searchMetadata(): Metadata {
  return {
    title: '搜索全球货源 - 懒老板',
    description: '在全球供应链中搜索工厂、商品和渠道，找到最合适的货源和供应商',
  }
}

export function productMetadata(name: string): Metadata {
  return {
    title: `${name} - 懒老板全球供应链`,
    description: `${name} — 查看商品详情、供应商信息、价格区间、平台口碑等`,
  }
}

export function categoriesMetadata(): Metadata {
  return {
    title: '全部分类 - 懒老板全球供应链',
    description: '浏览所有行业分类 — 跨境电商、餐饮供应链、服饰鞋包、家居日用等，找到你需要的货源品类',
  }
}

export function myResourcesMetadata(): Metadata {
  return {
    title: '我的资源库 - 懒老板',
    description: '管理你收藏的商品、工厂、物流渠道等资源',
  }
}
