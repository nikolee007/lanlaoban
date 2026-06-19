import Link from 'next/link'
import NavHeader from '@/app/components/NavHeader'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      <NavHeader />

      <div className="mx-auto max-w-3xl px-6 py-16 sm:py-20">
        <div className="mb-2">
          <h1 className="section-title">
            服务条款
          </h1>
          <p className="section-subtitle">最后更新：2025年1月</p>
        </div>

        <div className="card p-6 sm:p-8 prose prose-gray max-w-none prose-headings:text-gray-900 prose-headings:font-bold prose-h2:text-xl prose-h2:mt-10 prose-h2:mb-4 prose-p:text-gray-600 prose-p:leading-relaxed prose-ul:text-gray-600 prose-li:leading-relaxed">
          <h2>1. 接受条款</h2>
          <p>
            欢迎使用懒老板（以下简称"本平台"）。通过访问或使用本平台，即表示您同意受本服务条款（以下简称"条款"）的约束。如果您不同意这些条款，请勿使用本平台。
          </p>

          <h2>2. 服务描述</h2>
          <p>
            懒老板是一个为实体老板提供一站式服务的平台，包括但不限于：
          </p>
          <ul>
            <li>AI内容生成（短视频脚本、口播、场景方案等）</li>
            <li>全球供应链资源对接</li>
            <li>门店经营智能盘点与分析</li>
            <li>其他相关增值服务</li>
          </ul>

          <h2>3. 用户责任</h2>
          <p>使用本平台时，您同意：</p>
          <ul>
            <li>提供真实、准确、完整的注册信息，并及时更新</li>
            <li>对您的账户安全负责，不将账户转让或出借给他人</li>
            <li>遵守所有适用的法律法规</li>
            <li>不利用本平台从事任何违法或侵权活动</li>
            <li>不使用任何自动化手段（爬虫、机器人等）未经授权访问本平台</li>
          </ul>

          <h2>4. 知识产权</h2>
          <p>
            本平台及其全部内容（包括但不限于软件、设计、文字、图表、标识、图像、音频视频素材）的知识产权归懒老板或其许可方所有，受相关法律法规保护。
          </p>
          <p>
            您通过本平台生成的内容，其知识产权归属按照双方另行签署的协议执行。未经授权，您不得复制、修改、分发、出售或租赁本平台的任何部分。
          </p>

          <h2>5. 用户内容</h2>
          <p>
            您通过本平台上传、提交或发布的内容（如企业信息、商品资料等），您保留对该内容的所有权。您授予懒老板一项全球性、非独占、免许可费的使用许可，以便我们为您提供相关服务。
          </p>
          <p>
            您声明并保证您提交的内容不侵犯任何第三方权利，不包含违法或不当信息。
          </p>

          <h2>6. 免责声明</h2>
          <p>
            本平台按"现状"和"可用"的基础提供服务。在法律允许的最大范围内，懒老板不作任何明示或暗示的保证，包括但不限于：
          </p>
          <ul>
            <li>服务将不间断、及时、安全或无错误</li>
            <li>通过本平台获得的信息、建议或结果的准确性或可靠性</li>
            <li>供应商或商品信息的真实性、完整性和合法性</li>
          </ul>
          <p>
            懒老板不对因使用或无法使用本平台所导致的任何直接或间接损失承担责任。
          </p>

          <h2>7. 第三方链接与服务</h2>
          <p>
            本平台可能包含指向第三方网站或服务的链接。懒老板不对这些第三方的内容、隐私政策或实践负责。您需自行承担访问第三方的风险。
          </p>

          <h2>8. 账户终止</h2>
          <p>
            我们有权在不事先通知的情况下，暂停或终止违反本条款或法律法规的用户账户。您也可以随时通过联系客服来注销您的账户。
          </p>

          <h2>9. 条款变更</h2>
          <p>
            懒老板保留随时修改本条款的权利。重大变更将通过平台公告或电子邮件通知您。修改后的条款自发布之日起生效，继续使用本平台即表示您接受修改后的条款。
          </p>

          <h2>10. 联系我们</h2>
          <p>
            如果您对本条款有任何疑问，请通过平台帮助中心或反馈渠道联系我们。
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-8 text-center text-sm text-gray-400">
          <div className="flex items-center justify-center gap-4 mb-2">
            <Link href="/about" className="hover:text-gray-600 transition-colors">关于我们</Link>
            <Link href="/privacy" className="hover:text-gray-600 transition-colors">隐私政策</Link>
            <Link href="/faq" className="hover:text-gray-600 transition-colors">常见问题</Link>
          </div>
          懒老板 — 实体老板一站式生意平台
        </div>
      </footer>
    </div>
  )
}
