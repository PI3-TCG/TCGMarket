import mark from '@/assets/mark-3cartas-branco.svg'
import { GAMES } from './siteGames'

type Props = { onSoon: (feature: string) => void }
export function SiteFooter({ onSoon: soon }: Props) {
  return (
    <footer className="bg-primary-800 text-white">
      <div className="mx-auto grid w-full max-w-[1600px] gap-8 px-4 py-10 sm:grid-cols-2 lg:grid-cols-5">
        <div>
          <div className="flex items-center gap-2">
            <img src={mark} alt="" className="h-8 w-auto" />

            <span className="font-display text-sm tracking-wide">
              TCG MARKET
            </span>
          </div>

          <p className="mt-3 text-sm text-white/75">
            Colecione • Troque • Conecte
          </p>
        </div>

        <FooterColumn
          title="Sobre"

          links={['Quem somos', 'Como funciona', 'Blog']}

          onClick={(label) => soon(label)}
        />

        <FooterColumn
          title="Ajuda"

          links={[
            'Central de ajuda',

            'Termos de uso',

            'Política de privacidade',

            'Fale conosco',
          ]}

          onClick={(label) => soon(label)}
        />

        <FooterColumn
          title="Categorias"

          links={GAMES.map((game) => game.name)}

          onClick={(label) => soon(`O catálogo de ${label}`)}
        />

        <div>
          <p className="text-sm font-semibold">Acompanhe</p>

          <p className="mt-3 text-sm text-white/75">
            © {new Date().getFullYear()} TCG Market. Todos os direitos
            reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}

function FooterColumn({
  title,

  links,

  onClick,
}: {
  title: string

  links: string[]

  onClick: (label: string) => void
}) {
  return (
    <div>
      <p className="text-sm font-semibold">{title}</p>

      <ul className="mt-3 space-y-2">
        {links.map((link) => (
          <li key={link}>
            <button
              type="button"

              onClick={() => onClick(link)}

              className="text-sm text-white/75 hover:text-white"
            >
              {link}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
