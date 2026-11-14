import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import 'katex/dist/katex.min.css'
import { cn } from '@/lib/utils'

export function Markdown({ children, className }: { children: string; className?: string }) {
  return (
    <div className={cn('prose-jessica', className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          a: ({ href, children }) => (
            <a href={href} target="_blank" rel="noopener noreferrer nofollow">
              {children}
            </a>
          ),
          table: ({ children }) => (
            <div className="my-3 overflow-x-auto rounded-xl border border-line">
              <table>{children}</table>
            </div>
          ),
          input: (props) => <input {...props} disabled className="mr-1 accent-aurora-400" />,
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  )
}
