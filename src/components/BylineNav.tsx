interface NavLink {
  id: string
  href: string
  label: string
}

const navLinks: NavLink[] = [
  { id: 'projects', href: '#projects', label: 'Projects' },
  { id: 'til', href: '#til', label: 'TIL' },
  { id: 'techlogs', href: '#techlogs', label: 'Tech Logs' },
]

interface BylineNavProps {
  publisher: string
}

function BylineNav({ publisher }: BylineNavProps) {
  return (
    <div className="byline-bar">
      <span>{publisher}</span>
      <nav className="section-nav">
        {navLinks.map((link) => (
          <a key={link.id} href={link.href}>
            {link.label}
          </a>
        ))}
      </nav>
    </div>
  )
}

export default BylineNav
