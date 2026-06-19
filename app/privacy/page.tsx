import Link from 'next/link'
import NavHeader from '@/app/components/NavHeader'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      <NavHeader />

      <div className="mx-auto max-w-3xl px-6 py-16 sm:py-20">
        <div className="mb-2">
          <h1 className="section-title">
            隐私政策
          </h1>
          <p className="section-subtitle">最后更新：2025年1月</p>
        </div>

        <div className="card p-6 sm:p-8 prose prose-gray max-w-none prose-headings:text-gray-900 prose-headings:font-bold prose-h2:text-xl prose-h2:mt-10 prose-h2:mb-4 prose-p:text-gray-600 prose-p:leading-relaxed prose-ul:text-gray-600 prose-li:leading-relaxed">
          <h2>1. 信息收集</h2>
          <p>当您使用懒老板（以下简称"本平台"）时，我们可能会收集以下类型的信息：</p>
          <ul>
            <li><strong>账户信息：</strong>注册时提供的姓名、手机号、邮箱、企业名称等</li>
            <li><strong>使用信息：</strong>浏览记录、搜索记录、收藏、对话内容、生成内容等</li>
            <li><strong>设备信息：</strong>IP地址、浏览器类型、操作系统、设备标识符等</li>
            <li><strong>位置信息：</strong>您主动提供的地址信息或IP地址推断的大致位置</li>
            <li><strong>付款信息：</strong>如您使用付费服务，我们通过第三方支付服务商处理付款信息，不存储完整银行卡号</li>
          </ul>

          <h2>2. 信息使用</h2>
          <p>我们收集的信息用于以下目的：</p>
          <ul>
            <li>提供、维护和改进本平台的服务</li>
            <li>个性化您的使用体验</li>
            <li>处理交易和提供客户支持</li>
            <li>发送服务通知、更新和营销信息（您可随时退订）</li>
            <li>检测和防止欺诈、滥用和安全事件</li>
            <li>遵守法律义务</li>
          </ul>

          <h2>3. Cookie 政策</h2>
          <p>
            本平台使用Cookie和类似技术来提升用户体验。Cookie是存储在您设备上的小型文本文件，帮助我们记住您的偏好、分析使用模式。
          </p>
          <p>我们使用的Cookie类型：</p>
          <ul>
            <li><strong>必要Cookie：</strong>确保平台基本功能正常运行</li>
            <li><strong>功能Cookie：</strong>记住您的登录状态和偏好设置</li>
            <li><strong>分析Cookie：</strong>了解用户如何使用平台，帮助我们改进</li>
          </ul>
          <p>
            您可以通过浏览器设置管理或删除Cookie。关闭Cookie可能会影响平台的某些功能。
          </p>

          <h2>4. 信息共享</h2>
          <p>我们不会向第三方出售您的个人信息。但在以下情况，我们可能会共享您的信息：</p>
          <ul>
            <li><strong>服务提供商：</strong>与帮助我们运营平台的第三方服务商共享必要信息（如云服务、支付处理、客户支持等）</li>
            <li><strong>法律要求：</strong>应法律程序、法院命令或政府要求披露</li>
            <li><strong>业务转让：</strong>在合并、收购或资产出售的情况下，您的信息可能作为资产转让</li>
            <li><strong>您的同意：</strong>在获得您明确同意的情况下共享</li>
          </ul>

          <h2>5. 数据安全</h2>
          <p>
            我们采取合理的技术和管理措施保护您的个人信息安全，包括但不限于：
          </p>
          <ul>
            <li>使用SSL/TLS加密传输数据</li>
            <li>对敏感信息进行加密存储</li>
            <li>实施访问控制和权限管理</li>
            <li>定期进行安全审计和漏洞扫描</li>
          </ul>
          <p>
            尽管我们尽力保护您的信息，但没有任何互联网传输或电子存储方法是完全安全的。
          </p>

          <h2>6. 数据保留</h2>
          <p>
            我们仅在实现本隐私政策所述目的所必需的期限内保留您的个人信息，除非法律要求更长的保留期限。当不再需要时，我们将安全地删除或匿名化处理您的信息。
          </p>

          <h2>7. 您的权利</h2>
          <p>根据适用法律，您享有以下权利：</p>
          <ul>
            <li><strong>访问权：</strong>查询我们持有的您的个人信息</li>
            <li><strong>更正权：</strong>要求更正不准确的个人信息</li>
            <li><strong>删除权：</strong>要求删除您的个人信息（在特定条件下）</li>
            <li><strong>限制处理权：</strong>在特定情况下要求限制对您信息的处理</li>
            <li><strong>数据可携带权：</strong>以结构化、常用格式获取您的数据</li>
            <li><strong>撤回同意权：</strong>撤回您先前给予的同意</li>
          </ul>
          <p>
            如需行使上述权利，请通过平台的反馈渠道联系。
          </p>

          <h2>8. 儿童隐私</h2>
          <p>
            本平台不面向14周岁以下儿童。如发现我们无意中收集了儿童的个人信息，请立即联系我们，我们将及时删除。
          </p>

          <h2>9. 跨境传输</h2>
          <p>
            您的个人信息可能会被传输到并存储在中国大陆以外的服务器。我们将采取适当措施确保您的信息在传输后仍获得与境内同等水平的保护。
          </p>

          <h2>10. 政策更新</h2>
          <p>
            我们可能会不时更新本隐私政策。重大变更将通过平台公告或电子邮件通知。继续使用本平台即表示您同意更新后的政策。
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-8 text-center text-sm text-gray-400">
          <div className="flex items-center justify-center gap-4 mb-2">
            <Link href="/about" className="hover:text-gray-600 transition-colors">关于我们</Link>
            <Link href="/terms" className="hover:text-gray-600 transition-colors">服务条款</Link>
            <Link href="/faq" className="hover:text-gray-600 transition-colors">常见问题</Link>
          </div>
          懒老板 — 实体老板一站式生意平台
        </div>
      </footer>
    </div>
  )
}
