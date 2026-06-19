'use client'
import { Component, type ReactNode } from 'react'
import Link from 'next/link'
import { FiAlertTriangle, FiRefreshCw, FiHome } from 'react-icons/fi'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  fullPage?: boolean
  onError?: (error: Error, errorInfo: { componentStack: string }) => void
}

interface State {
  hasError: boolean
  error: Error | null
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: { componentStack: string }) {
    console.error('[ErrorBoundary]', error.message, errorInfo.componentStack)
    this.props.onError?.(error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback

      if (this.props.fullPage) {
        return (
          <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
            <div className="max-w-md text-center">
              <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-6">
                <FiAlertTriangle className="w-10 h-10 text-red-400" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">页面渲染出错了</h1>
              <p className="text-gray-500 mb-2">遇到了一个意外错误，请尝试重试</p>
              <p className="text-xs text-gray-400 mb-8 font-mono bg-gray-100 rounded p-2 truncate max-w-full">
                {this.state.error?.message || '未知错误'}
              </p>
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={() => this.setState({ hasError: false, error: null })}
                  className="inline-flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:brightness-110"
                  style={{ backgroundColor: '#FF6034' }}
                >
                  <FiRefreshCw className="w-4 h-4" /> 重试
                </button>
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 rounded-lg border-2 px-6 py-3 text-sm font-semibold transition-all hover:bg-gray-50"
                  style={{ borderColor: '#FF6034', color: '#FF6034' }}
                >
                  <FiHome className="w-4 h-4" /> 回到首页
                </Link>
              </div>
            </div>
          </div>
        )
      }

      return (
        <div className="flex flex-col items-center justify-center rounded-xl border border-red-100 bg-red-50 px-6 py-10 text-center">
          <FiAlertTriangle className="mb-3 h-8 w-8 text-red-400" />
          <h3 className="mb-1 text-sm font-semibold text-red-700">区块加载失败</h3>
          <p className="mb-3 max-w-xs text-xs text-red-500">
            {this.state.error?.message || '该区块数据异常，请稍后重试'}
          </p>
          <button
            type="button"
            onClick={() => this.setState({ hasError: false, error: null })}
            className="rounded-lg bg-red-500 px-4 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-red-600"
          >
            重试
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
